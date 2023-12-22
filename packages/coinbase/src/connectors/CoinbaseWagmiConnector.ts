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
import {
  WalletMobileSDKEVMProvider,
  configure,
  isCoinbaseWalletInstalled
} from '@coinbase/wallet-mobile-sdk';
import type { WalletMobileSDKProviderOptions } from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';

const ADD_ETH_CHAIN_METHOD = 'wallet_addEthereumChain';
const SWITCH_ETH_CHAIN_METHOD = 'wallet_switchEthereumChain';

type CoinbaseWagmiConnectorOptions = WalletMobileSDKProviderOptions & {
  redirect: string;
};

export class CoinbaseWagmiConnector extends Connector<
  WalletMobileSDKEVMProvider,
  CoinbaseWagmiConnectorOptions
> {
  readonly id = 'coinbaseWallet';
  readonly name = 'Coinbase Wallet';
  readonly ready = true;
  readonly installed = isCoinbaseWalletInstalled();

  private _provider?: WalletMobileSDKEVMProvider;
  private _initProviderPromise?: Promise<void>;

  constructor(config: { chains?: Chain[]; options: CoinbaseWagmiConnectorOptions }) {
    super(config);
    this._createProvider();
  }

  override connect = async (
    config?: { chainId?: number | undefined } | undefined
  ): Promise<Required<ConnectorData>> => {
    try {
      await this._setupListeners();
      const provider = await this.getProvider();

      const isConnected = provider.connected;

      if (!isConnected) {
        await provider.request({
          method: 'eth_requestAccounts',
          params: []
        });
      }

      const address = provider.selectedAddress!;
      const chainId = config?.chainId;

      this.emit('message', { type: 'connecting' });

      // Switch to chain if provided
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }

      return {
        account: address as `0x${string}`,
        chain: { id, unsupported }
      };
    } catch (error) {
      if (/(Error error 0|User rejected the request)/i.test((error as Error).message))
        throw new UserRejectedRequestError(error as Error);

      if (/(Error error 5|Could not open wallet)/i.test((error as Error).message))
        throw new Error(`Wallet not found. SDK Error: ${(error as Error).message}`);

      throw error;
    }
  };

  override disconnect = async (): Promise<void> => {
    if (!this._provider) return;

    const provider = await this.getProvider();
    this._removeListeners();
    provider.disconnect();
  };

  override async getAccount(): Promise<`0x${string}`> {
    const provider = await this.getProvider();
    const accounts = await provider.request<Address[]>({
      method: 'eth_accounts'
    });

    return getAddress(accounts[0] as string);
  }

  override getChainId = async (): Promise<number> => {
    const provider = await this.getProvider();

    return this._normalizeChainId(provider.chainId);
  };

  override getProvider = async ({ chainId }: { chainId?: number } = {}) => {
    if (!this._provider) await this._createProvider();
    if (chainId) await this.switchChain(chainId);

    return this._provider!;
  };

  override getWalletClient = async ({
    chainId
  }: { chainId?: number } = {}): Promise<WalletClient> => {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()]);
    const chain = this.chains.find(x => x.id === chainId);
    if (!provider) throw new Error('provider is required.');

    // @ts-ignore
    return createWalletClient({
      account,
      chain,
      transport: custom(provider)
    });
  };

  override isAuthorized = async (): Promise<boolean> => {
    try {
      const account = await this.getAccount();

      return !!account;
    } catch {
      return false;
    }
  };

  override switchChain = async (chainId: number) => {
    const provider = await this.getProvider();
    const id = numberToHex(chainId);
    const chain = this.chains.find(_chain => _chain.id === chainId);
    if (!chain)
      throw new SwitchChainError(
        new Error(`Chain "${chainId}" not configured for connector "${this.id}".`)
      );

    try {
      await provider.request({
        method: SWITCH_ETH_CHAIN_METHOD,
        params: [{ chainId: id }]
      });

      return chain;
    } catch (error) {
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
  };

  protected override onAccountsChanged = (accounts: `0x${string}`[]): void => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0] as string) });
  };

  protected override onChainChanged = (chain: string | number): void => {
    const id = Number(chain);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  protected override onDisconnect = (): void => {
    this.emit('disconnect');
  };

  private async _createProvider() {
    if (!this._initProviderPromise) {
      this._initProviderPromise = this._initProvider();
    }

    return this._initProviderPromise;
  }

  private _initProvider = async () => {
    configure({
      callbackURL: new URL(this.options.redirect),
      hostURL: new URL('https://wallet.coinbase.com/wsegue'), // Don't change -> Coinbase url
      hostPackageName: 'org.toshi' // Don't change -> Coinbase wallet scheme
    });

    this._provider = new WalletMobileSDKEVMProvider({ ...this.options });
  };

  private _setupListeners = async () => {
    const provider = await this.getProvider();
    this._removeListeners();
    provider.on('accountsChanged', this.onAccountsChanged);
    provider.on('chainChanged', this.onChainChanged);
    provider.on('disconnect', this.onDisconnect);
  };

  private _removeListeners = () => {
    if (!this._provider) return;

    this._provider.removeListener('accountsChanged', this.onAccountsChanged);
    this._provider.removeListener('chainChanged', this.onChainChanged);
    this._provider.removeListener('disconnect', this.onDisconnect);
  };

  private _normalizeChainId = (chainId: string | number | bigint) => {
    if (typeof chainId === 'string')
      return Number.parseInt(chainId, chainId.trim().substring(0, 2) === '0x' ? 16 : 10);
    if (typeof chainId === 'bigint') return Number(chainId);

    return chainId;
  };
}
