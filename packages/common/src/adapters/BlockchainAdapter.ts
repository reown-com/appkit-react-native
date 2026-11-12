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
} from '../types';
import { NetworkUtil } from '../utils/NetworkUtil';

export abstract class BlockchainAdapter extends EventEmitter {
  public connector?: WalletConnector;
  public supportedNamespace: ChainNamespace;
  public adapterType: AdapterType;

  // Provider we are currently listening to, so we can remove the exact same handlers later
  private subscribedProvider?: Provider;

  // Stable handler references. `off` only removes a listener when it receives the same
  // function that was passed to `on`, so these must not be recreated with `.bind` each time.
  private readonly handleChainChanged = (chainId: string) => this.onChainChanged(chainId);
  private readonly handleAccountsChanged = (accounts: string[]) => this.onAccountsChanged(accounts);
  private readonly handleDisconnect = () => this.onDisconnect();

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
    this.unsubscribeFromEvents();
    this.connector = undefined;
  }

  getProvider(): Provider {
    if (!this.connector) throw new Error('No active connector');

    return this.connector.getProvider(this.getSupportedNamespace());
  }

  protected subscribeToEvents(): void {
    // Drop any previous subscription first, so calling init again doesn't stack listeners
    this.unsubscribeFromEvents();

    const provider = this.connector?.getProvider();
    if (!provider) return;

    provider.on('chainChanged', this.handleChainChanged);
    provider.on('accountsChanged', this.handleAccountsChanged);
    provider.on('disconnect', this.handleDisconnect);
    this.subscribedProvider = provider;
  }

  protected unsubscribeFromEvents(): void {
    const provider = this.subscribedProvider;
    if (!provider) return;

    provider.off('chainChanged', this.handleChainChanged);
    provider.off('accountsChanged', this.handleAccountsChanged);
    provider.off('disconnect', this.handleDisconnect);
    this.subscribedProvider = undefined;
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
    // Normalize incoming accounts to lowercase for case-insensitive comparison
    const normalizedIncomingAccounts = accounts.map(addr => addr.toLowerCase());

    // Filter: Keep only adapter accounts (CAIP) whose plain address is in the incoming accounts array
    const updatedAccounts =
      _accounts
        ?.filter(account => {
          // Normalize to lowercase for case-insensitive comparison since plain addresses from CAIP may vary in casing
          const accountAddress = NetworkUtil.getPlainAddress(account)?.toLowerCase();

          return (
            accountAddress !== undefined && normalizedIncomingAccounts.includes(accountAddress)
          );
        })
        // Sort: Maintain the order from the incoming accounts parameter
        .sort((a, b) => {
          const aAddress = NetworkUtil.getPlainAddress(a)?.toLowerCase() ?? '';
          const bAddress = NetworkUtil.getPlainAddress(b)?.toLowerCase() ?? '';
          const aIndex = normalizedIncomingAccounts.indexOf(aAddress);
          const bIndex = normalizedIncomingAccounts.indexOf(bAddress);

          return aIndex - bIndex;
        }) ?? [];

    if (updatedAccounts.length > 0) {
      this.emit('accountsChanged', { accounts: updatedAccounts });
    }
  }

  onDisconnect(): void {
    // Emit before clearing the connector: listeners (ConnectionsController.disconnect) read it
    this.emit('disconnect', undefined);

    this.unsubscribeFromEvents();
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
