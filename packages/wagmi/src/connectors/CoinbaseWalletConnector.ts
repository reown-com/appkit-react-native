import { Connector, type ConnectorData, type WalletClient } from 'wagmi';
import {
  createWalletClient,
  custom,
  getAddress,
  type Address,
  UserRejectedRequestError,
  numberToHex,
  ProviderRpcError,
  SwitchChainError,
  type Chain
} from 'viem';
import { WalletMobileSDKEVMProvider, configure } from '@coinbase/wallet-mobile-sdk';
// import type { WalletMobileSDKProviderOptions } from '@coinbase/wallet-mobile-sdk/src/WalletMobileSDKEVMProvider';

const ADD_ETH_CHAIN_METHOD = 'wallet_addEthereumChain';
const SWITCH_ETH_CHAIN_METHOD = 'wallet_switchEthereumChain';

interface WalletMobileSDKProviderOptions {
  chainId?: number;
  jsonRpcUrl?: string;
  address?: string;
  callbackURL: string;
  //storage
}

export class CoinbaseWalletConnector extends Connector<
  WalletMobileSDKEVMProvider,
  WalletMobileSDKProviderOptions
> {
  readonly id = 'coinbaseWallet';
  readonly name = 'Coinbase Wallet';
  readonly ready = true;

  _provider?: WalletMobileSDKEVMProvider;
  _initProviderPromise?: Promise<void>;

  constructor(config: { chains?: Chain[]; options: WalletMobileSDKProviderOptions }) {
    super(config);
    this._createProvider();
  }

  override async connect(
    config?: { chainId?: number | undefined } | undefined
  ): Promise<Required<ConnectorData>> {
    try {
      await this._setupListeners();
      const provider = await this.getProvider();
      const accounts: string[] = await provider.request({
        method: 'eth_requestAccounts',
        params: []
      });

      const chainId = config?.chainId;

      this.emit('message', { type: 'connecting' });

      // Switch to chain if provided
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported?.(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported?.(id);
      }

      return {
        account: accounts?.[0] as `0x${string}`,
        chain: { id, unsupported }
      };
    } catch (error) {
      if (/(user closed modal|accounts received is empty)/i.test((error as Error).message))
        throw new UserRejectedRequestError(error as Error);
      throw error;
    }
  }

  override async disconnect(): Promise<void> {
    if (!this._provider) return;

    const provider = await this.getProvider();
    this.__removeListeners();
    provider.disconnect();
  }

  override async getAccount(): Promise<`0x${string}`> {
    const provider = await this.getProvider();
    const accounts = await provider.request<Address[]>({
      method: 'eth_accounts'
    });

    return getAddress(accounts[0] as string);
  }

  override async getChainId(): Promise<number> {
    const provider = await this.getProvider();

    return this._normalizeChainId(provider.chainId);
  }

  override async getProvider({ chainId }: { chainId?: number } = {}) {
    if (!this._provider) await this._createProvider();
    if (chainId) await this.switchChain(chainId);

    return this._provider!;
  }

  override async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<WalletClient> {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()]);
    const chain = this.chains.find(x => x.id === chainId);
    if (!provider) throw new Error('provider is required.');

    // @ts-ignore
    return createWalletClient({
      account,
      chain,
      transport: custom(provider)
    });
  }

  override async isAuthorized(): Promise<boolean> {
    try {
      const account = await this.getAccount();

      return !!account;
    } catch {
      return false;
    }
  }

  override async switchChain(chainId: number) {
    const provider = await this.getProvider();
    const id = numberToHex(chainId);

    try {
      await provider.request({
        method: SWITCH_ETH_CHAIN_METHOD,
        params: [{ chainId: id }]
      });

      return (
        this.chains.find(x => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } }
        }
      );
    } catch (error) {
      const chain = this.chains.find(x => x.id === chainId);
      if (!chain) throw new Error(`Chain "${chainId}" not configured for connector "${this.id}".`);

      // Indicates chain is not added to provider
      if ((error as ProviderRpcError).code === 4902) {
        try {
          await provider.request({
            method: ADD_ETH_CHAIN_METHOD,
            params: [
              {
                chainId: id,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls.public?.http[0] ?? ''],
                blockExplorerUrls: this.getBlockExplorerUrls(chain)
              }
            ]
          });

          return chain;
        } catch (e) {
          throw new UserRejectedRequestError(e as Error);
        }
      }

      throw new SwitchChainError(error as Error);
    }
  }

  protected override onAccountsChanged(accounts: `0x${string}`[]): void {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0] as string) });
  }

  protected override onChainChanged(chain: string | number): void {
    const id = Number(chain);
    //TODO: check this
    const unsupported = this.isChainUnsupported?.(id);
    this.emit('change', { chain: { id, unsupported } });
  }

  protected override onDisconnect(): void {
    this.emit('disconnect');
  }

  async _createProvider() {
    if (!this._initProviderPromise) {
      this._initProviderPromise = this._initProvider();
    }

    return this._initProviderPromise;
  }

  async _initProvider() {
    configure({
      callbackURL: new URL(this.options.callbackURL),
      hostPackageName: 'org.toshi' // Coinbase wallet deeplink
    });

    const defaultChainId = this.chains?.[0]?.id;
    this._provider = new WalletMobileSDKEVMProvider({ ...this.options, chainId: defaultChainId });
  }

  async _setupListeners() {
    const provider = await this.getProvider();
    this.__removeListeners();
    provider.on('accountsChanged', this.onAccountsChanged);
    provider.on('chainChanged', this.onChainChanged);
    provider.on('disconnect', this.onDisconnect);
  }

  __removeListeners() {
    if (!this._provider) return;

    this._provider.removeListener('accountsChanged', this.onAccountsChanged);
    this._provider.removeListener('chainChanged', this.onChainChanged);
    this._provider.removeListener('disconnect', this.onDisconnect);
  }

  _normalizeChainId(chainId: string | number | bigint) {
    if (typeof chainId === 'string')
      return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10);
    if (typeof chainId === 'bigint') return Number(chainId);

    return chainId;
  }
}
