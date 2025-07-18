import { EventEmitter } from 'events';
import type {
  AdapterEvents,
  AdapterType,
  AppKitNetwork,
  BlockchainAdapterConfig,
  CaipAddress,
  ChainNamespace,
  GetBalanceParams,
  GetBalanceResponse,
  Provider,
  WalletConnector
} from '../utils/TypeUtil';

export abstract class BlockchainAdapter extends EventEmitter {
  public projectId: string;
  public connector?: WalletConnector;
  public supportedNamespace: ChainNamespace;
  public adapterType: AdapterType;

  // Typed emit method
  override emit<K extends keyof AdapterEvents>(
    event: K,
    payload: Parameters<AdapterEvents[K]>[0]
  ): boolean {
    return super.emit(event, payload);
  }

  constructor({ projectId, supportedNamespace, adapterType }: BlockchainAdapterConfig) {
    super();
    this.projectId = projectId;
    this.supportedNamespace = supportedNamespace;
    this.adapterType = adapterType;
  }

  setConnector(connector: WalletConnector) {
    this.connector = connector;
    this.subscribeToEvents();
  }

  removeConnector() {
    this.connector = undefined;
  }

  getProvider(): Provider {
    if (!this.connector) throw new Error('No active connector');

    return this.connector.getProvider();
  }

  subscribeToEvents(): void {
    const provider = this.connector?.getProvider();
    if (!provider) return;

    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }

  onChainChanged(chainId: string): void {
    const _chains = this.getAccounts()?.map(account => account.split(':')[1]);
    const shouldEmit = _chains?.some(chain => chain === chainId);

    if (shouldEmit) {
      this.emit('chainChanged', { chainId });
    }
  }

  onAccountsChanged(accounts: string[]): void {
    const _accounts = this.getAccounts();
    const shouldEmit = _accounts?.some(account => {
      const accountAddress = account.split(':')[2];

      return accountAddress !== undefined && accounts.includes(accountAddress);
    });

    if (shouldEmit) {
      this.emit('accountsChanged', { accounts });
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

  parseUnits(value: string, decimals: number): bigint {
    const [whole, fraction = ''] = value.split('.');
    const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);

    return BigInt(whole + paddedFraction);
  }

  abstract disconnect(): Promise<void>;
  abstract getSupportedNamespace(): ChainNamespace;
  abstract getBalance(params: GetBalanceParams): Promise<GetBalanceResponse>;
  abstract getAccounts(): CaipAddress[] | undefined;
  abstract switchNetwork(network: AppKitNetwork): Promise<void>;
}
