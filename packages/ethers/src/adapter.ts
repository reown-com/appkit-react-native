import {
  EVMAdapter,
  WalletConnector,
  type SignedTransaction,
  type TransactionData,
  type TransactionReceipt
} from '@reown/appkit-react-native';

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

  async getBalance(address: string): Promise<string> {
    if (!this.connector) throw new Error('No active connector');

    return this.request('eth_getBalance', [address, 'latest']) as Promise<string>;
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
    console.log('adapter chainChanged', chainId);
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    console.log('adapter accountsChanged', accounts);
    // Emit this change to AppKit with the corresponding namespace.
    this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
  }

  onDisconnect(): void {
    console.log('adapter onDisconnect');
    this.emit('disconnect', { namespace: this.getSupportedNamespace() });

    //the connector might be shared between adapters. Validate this
    const provider = this.connector?.getProvider();
    if (provider) {
      provider.off('chainChanged', this.onChainChanged.bind(this));
      provider.off('accountsChanged', this.onAccountsChanged.bind(this));
      provider.off('disconnect', this.onDisconnect.bind(this));
      console.log('Removed listeners from provider on disconnect');
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

    console.log('subscribing to events');
    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
    //@ts-ignore
    console.log('subscribed to events', provider?.events);

    provider.on('accountsChanged', () => {
      console.log('accountsChanged');
    });
  }
}
