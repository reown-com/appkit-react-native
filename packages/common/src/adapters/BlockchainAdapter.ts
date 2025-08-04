import { EventEmitter } from 'events';
import type {
  AdapterEvents,
  AdapterType,
  AppKitNetwork,
  BlockchainAdapterConfig,
  BlockchainAdapterInitParams,
  CaipAddress,
  ChainNamespace,
  GetBalanceParams,
  GetBalanceResponse,
  Provider,
  WalletConnector
} from '../utils/TypeUtil';
import { NetworkUtil } from '../utils/NetworkUtil';

export abstract class BlockchainAdapter extends EventEmitter {
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

  // Typed on method
  override on<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]): this {
    return super.on(event, listener);
  }

  // Typed off method for consistency
  override off<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]): this {
    return super.off(event, listener);
  }

  constructor({ supportedNamespace, adapterType }: BlockchainAdapterConfig) {
    super();
    this.supportedNamespace = supportedNamespace;
    this.adapterType = adapterType;
  }

  init({ connector }: BlockchainAdapterInitParams) {
    this.connector = connector;

    this.subscribeToEvents();
  }

  removeConnector() {
    this.connector = undefined;
  }

  getProvider(): Provider {
    if (!this.connector) throw new Error('No active connector');

    return this.connector.getProvider(this.getSupportedNamespace());
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
    const updatedAccounts =
      _accounts
        ?.filter(account => {
          const accountAddress = NetworkUtil.getPlainAddress(account);

          return accountAddress !== undefined && accounts.includes(accountAddress);
        })
        ?.sort((a, b) => {
          const aIndex = accounts.indexOf(NetworkUtil.getPlainAddress(a) ?? '');
          const bIndex = accounts.indexOf(NetworkUtil.getPlainAddress(b) ?? '');

          return aIndex - bIndex;
        }) ?? [];

    if (updatedAccounts.length > 0) {
      this.emit('accountsChanged', { accounts: updatedAccounts });
    }
  }

  onDisconnect(): void {
    this.emit('disconnect', undefined);

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
