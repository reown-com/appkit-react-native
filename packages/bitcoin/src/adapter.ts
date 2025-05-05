import {
  BlockchainAdapter,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { BitcoinApi } from './utils/BitcoinApi';
import { UnitsUtil } from './utils/UnitsUtil';

export class BitcoinAdapter extends BlockchainAdapter {
  private static supportedNamespace: string = 'bip122';
  private static api = BitcoinApi;

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: BitcoinAdapter.supportedNamespace
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceCaipAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    const balanceAddress = balanceCaipAddress?.split(':')[2];

    if (!balanceCaipAddress || !balanceAddress) {
      return Promise.resolve({ amount: '0.00', symbol: 'BTC' });
    }

    try {
      const utxos = await BitcoinAdapter.api.getUTXOs({
        network,
        address: balanceAddress
      });

      const balance = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
      const formattedBalance = UnitsUtil.parseSatoshis(balance.toString(), network);

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address: balanceCaipAddress,
        balance: {
          amount: formattedBalance,
          symbol: network.nativeCurrency.symbol
        }
      });

      return { amount: formattedBalance, symbol: network.nativeCurrency.symbol };
    } catch (error) {
      return { amount: '0.00', symbol: 'BTC' };
    }
  }

  override async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
    if (!provider) throw new Error('No active provider');

    try {
      await this.connector.switchNetwork(network);

      return;
    } catch (switchError: any) {
      throw switchError;
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  disconnect(): Promise<void> {
    if (!this.connector) throw new Error('SolanaAdapter:disconnect - No active connector');

    return this.connector.disconnect();
  }

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('No active connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): string {
    return BitcoinAdapter.supportedNamespace;
  }

  onChainChanged(chainId: string): void {
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    const _accounts = this.getAccounts();
    const shouldEmit = _accounts?.some(account => {
      const accountAddress = account.split(':')[2];

      return accountAddress !== undefined && accounts.includes(accountAddress);
    });

    if (shouldEmit) {
      this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
    }
  }

  onDisconnect(): void {
    this.emit('disconnect', { namespace: this.getSupportedNamespace() });

    const provider = this.connector?.getProvider();
    if (provider) {
      provider.off('chainChanged', this.onChainChanged.bind(this));
      provider.off('accountsChanged', this.onAccountsChanged.bind(this));
      provider.off('disconnect', this.onDisconnect.bind(this));
    }

    this.connector = undefined;
  }

  override setConnector(connector: WalletConnector): void {
    super.setConnector(connector);
    this.subscribeToEvents();
  }

  subscribeToEvents(): void {
    const provider = this.connector?.getProvider();
    if (!provider) return;

    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }
}
