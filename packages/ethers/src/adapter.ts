import { formatEther, JsonRpcProvider } from 'ethers';
import {
  EVMAdapter,
  PresetsUtil,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type GetBalanceParams,
  type GetBalanceResponse,
  type SignedTransaction,
  type TransactionData,
  type TransactionReceipt
} from '@reown/appkit-common-react-native';
import { EthersHelpersUtil } from '@reown/appkit-scaffold-utils-react-native';

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
    if (!params.network) throw new Error('No network provided');

    const address = params.address || this.getAccounts()?.[0];
    const network = params.network;

    let balance = { amount: '0.00', symbol: network.nativeCurrency.symbol || 'ETH' };

    if (!address) {
      return Promise.resolve(balance);
    }

    const account = address.split(':')[2];

    try {
      const jsonRpcProvider = new JsonRpcProvider(network.rpcUrls.default.http[0], {
        chainId: Number(network.id),
        name: network.name
      });

      if (jsonRpcProvider && account) {
        const _balance = await jsonRpcProvider.getBalance(account);
        const formattedBalance = formatEther(_balance);

        balance = { amount: formattedBalance, symbol: network.nativeCurrency.symbol || 'ETH' };
      }

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address,
        balance
      });

      return balance;
    } catch (error) {
      // console.error('EthersAdapter - getBalance', error);

      return balance;
    }
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
    if (!provider) throw new Error('No active provider');

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EthersHelpersUtil.numberToHexString(Number(network.id)) }] //TODO: check util
      });

      this.getBalance({ address: this.getAccounts()?.[0], network });

      return;
    } catch (switchError: any) {
      const message = switchError?.message as string;
      if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
        throw new Error('Chain is not supported');
      }

      provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: EthersHelpersUtil.numberToHexString(Number(network.id)),
            rpcUrls: network.rpcUrls,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            blockExplorerUrls: network.blockExplorers,
            iconUrls: [PresetsUtil.EIP155NetworkImageIds[network.id]]
          }
        ]
      });
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
    // console.log('EthersAdapter - onChainChanged', chainId);
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    // console.log('EthersAdapter - onAccountsChanged', accounts);
    // Emit this change to AppKit with the corresponding namespace.
    this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
  }

  onDisconnect(): void {
    // console.log('EthersAdapter - onDisconnect');
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

    // console.log('EthersAdapter - subscribing to events');
    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }
}
