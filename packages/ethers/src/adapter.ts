import { formatEther, JsonRpcProvider } from 'ethers';
import {
  EVMAdapter,
  WalletConnector,
  type CaipAddress,
  type GetBalanceParams,
  type GetBalanceResponse,
  type SignedTransaction,
  type TransactionData,
  type TransactionReceipt
} from '@reown/appkit-common-react-native';

export class EthersAdapter extends EVMAdapter {
  private static supportedNamespace: string = 'eip155';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: EthersAdapter.supportedNamespace
    });
  }

  async signTransaction(tx: TransactionData): Promise<SignedTransaction> {
    if (!this.connector) throw new Error('No active connector');

    return this.request('eth_signTransaction', [tx]) as Promise<SignedTransaction>;
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    if (!this.connector) throw new Error('No active connector');

    const address = params.address || this.getAccounts()?.[0];

    if (!address) {
      return Promise.resolve({ amount: '0.00', symbol: 'ETH' });
    }

    const chainId = Number(address.split(':')[1]) ?? 1;
    const account = address.split(':')[2];

    try {
      //TODO use networks
      const jsonRpcProvider = new JsonRpcProvider('https://eth.llamarpc.com', {
        chainId: chainId,
        name: 'Ethereum Mainnet'
      });
      let balance = { amount: '0.00', symbol: 'ETH' };

      if (jsonRpcProvider && account) {
        const _balance = await jsonRpcProvider.getBalance(account);
        const formattedBalance = formatEther(_balance);

        balance = { amount: formattedBalance, symbol: 'ETH' };
      }

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address,
        balance
      });

      return balance;
    } catch (error) {
      return { amount: '0.00', symbol: 'ETH' };
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  sendTransaction(/*tx: TransactionData*/): Promise<TransactionReceipt> {
    throw new Error('Method not implemented.');
  }

  disconnect(): Promise<void> {
    if (!this.connector) throw new Error('EthersAdapter:disconnect - No active connector');

    return this.connector.disconnect();
  }

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('No active connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): string {
    return EthersAdapter.supportedNamespace;
  }

  onChainChanged(chainId: string): void {
    console.log('EthersAdapter - onChainChanged', chainId);
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    console.log('EthersAdapter - onAccountsChanged', accounts);
    // Emit this change to AppKit with the corresponding namespace.
    this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
  }

  onDisconnect(): void {
    console.log('EthersAdapter - onDisconnect');
    this.emit('disconnect', { namespace: this.getSupportedNamespace() });

    //the connector might be shared between adapters. Validate this
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

    console.log('EthersAdapter - subscribing to events');
    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }
}
