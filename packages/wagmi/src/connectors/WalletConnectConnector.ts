import type WalletConnectProvider from '@walletconnect/ethereum-provider';
import { type EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { normalizeNamespaces } from '@walletconnect/utils';
import {
  ProviderRpcError,
  SwitchChainError,
  UserRejectedRequestError,
  createWalletClient,
  custom,
  getAddress,
  numberToHex
} from 'viem';

import type { Account, Chain, Transport, WalletClient as WalletClient_ } from 'viem';
import type { ConnectorData } from 'wagmi';

import { Connector } from 'wagmi';

import {
  EthereumProvider,
  OPTIONAL_EVENTS,
  OPTIONAL_METHODS
} from '@walletconnect/ethereum-provider';

import { StorageUtils } from '../utils/storageUtils';

export type StorageStoreData = {
  state: { data?: ConnectorData };
};

export type WalletClient<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends Account = Account
> = WalletClient_<TTransport, TChain, TAccount>;

type WalletConnectOptions = {
  /**
   * WalletConnect Cloud Project ID.
   * @link https://cloud.walletconnect.com/sign-in.
   */
  projectId: EthereumProviderOptions['projectId'];
  /**
   * If a new chain is added to a previously existing configured connector `chains`, this flag
   * will determine if that chain should be considered as stale. A stale chain is a chain that
   * WalletConnect has yet to establish a relationship with (ie. the user has not approved or
   * rejected the chain).
   *
   * Preface: Whereas WalletConnect v1 supported dynamic chain switching, WalletConnect v2 requires
   * the user to pre-approve a set of chains up-front. This comes with consequent UX nuances (see below) when
   * a user tries to switch to a chain that they have not approved.
   *
   * This flag mainly affects the behavior when a wallet does not support dynamic chain authorization
   * with WalletConnect v2.
   *
   * If `true` (default), the new chain will be treated as a stale chain. If the user
   * has yet to establish a relationship (approved/rejected) with this chain in their WalletConnect
   * session, the connector will disconnect upon the dapp auto-connecting, and the user will have to
   * reconnect to the dapp (revalidate the chain) in order to approve the newly added chain.
   * This is the default behavior to avoid an unexpected error upon switching chains which may
   * be a confusing user experience (ie. the user will not know they have to reconnect
   * unless the dapp handles these types of errors).
   *
   * If `false`, the new chain will be treated as a validated chain. This means that if the user
   * has yet to establish a relationship with the chain in their WalletConnect session, wagmi will successfully
   * auto-connect the user. This comes with the trade-off that the connector will throw an error
   * when attempting to switch to the unapproved chain. This may be useful in cases where a dapp constantly
   * modifies their configured chains, and they do not want to disconnect the user upon
   * auto-connecting. If the user decides to switch to the unapproved chain, it is important that the
   * dapp handles this error and prompts the user to reconnect to the dapp in order to approve
   * the newly added chain.
   *
   * @default true
   */
  isNewChainsStale?: boolean;
  /**
   * Metadata for your app.
   * @link https://docs.walletconnect.com/2.0/javascript/providers/ethereum#initialization
   */
  metadata?: EthereumProviderOptions['metadata'];
  /**
   * Whether or not to show the QR code modal.
   * @default true
   * @link https://docs.walletconnect.com/2.0/javascript/providers/ethereum#initialization
   */
  showQrModal?: EthereumProviderOptions['showQrModal'];
  /**
   * Options of QR code modal.
   * @link https://docs.walletconnect.com/2.0/web/walletConnectModal/modal/options
   */
  qrModalOptions?: EthereumProviderOptions['qrModalOptions'];
  /**
   * Option to override default relay url.
   * @link https://docs.walletconnect.com/2.0/web/providers/ethereum
   */
  relayUrl?: string;
};

type ConnectConfig = {
  /** Target chain to connect to. */
  chainId?: number;
  /** If provided, will attempt to connect to an existing pairing. */
  pairingTopic?: string;
};

const NAMESPACE = 'eip155';
const STORE_KEY = 'store';
const REQUESTED_CHAINS_KEY = 'requestedChains';
const ADD_ETH_CHAIN_METHOD = 'wallet_addEthereumChain';
const SWITCH_ETH_CHAIN_METHOD = 'wallet_switchEthereumChain';

export class WalletConnectConnector extends Connector<WalletConnectProvider, WalletConnectOptions> {
  readonly id = 'walletConnect';
  readonly name = 'WalletConnect';
  readonly ready = true;

  _provider?: WalletConnectProvider;
  _initProviderPromise?: Promise<void>;

  constructor(config: { chains?: Chain[]; options: WalletConnectOptions }) {
    super({
      ...config,
      options: { isNewChainsStale: true, ...config.options }
    });
    this._createProvider();
  }

  async connect({ chainId, pairingTopic }: ConnectConfig = {}) {
    try {
      let targetChainId = chainId;
      if (!targetChainId) {
        const store = await StorageUtils.getItem<StorageStoreData>(STORE_KEY);
        const lastUsedChainId = store?.state?.data?.chain?.id;
        if (lastUsedChainId && !this.isChainUnsupported(lastUsedChainId))
          targetChainId = lastUsedChainId;
        else targetChainId = this.chains[0]?.id;
      }
      if (!targetChainId) throw new Error('No chains found on connector.');

      const provider = await this.getProvider();
      this._setupListeners();

      const isChainsStale = await this._isChainsStale();

      // If there is an active session with stale chains, disconnect the current session.
      if (provider.session && isChainsStale) {
        await provider.disconnect();
      }

      // If there no active session, or the chains are stale, connect.
      if (!provider.session || isChainsStale) {
        const optionalChains = this.chains
          .filter(chain => chain.id !== targetChainId)
          .map(optionalChain => optionalChain.id);

        this.emit('message', { type: 'connecting' });

        await provider.connect({
          pairingTopic,
          chains: [targetChainId],
          optionalChains: optionalChains.length ? optionalChains : undefined
        });

        this._setRequestedChainsIds(this.chains.map(({ id }) => id));
      }

      // If session exists and chains are authorized, enable provider for required chain
      const accounts = await provider.enable();
      const account = getAddress(accounts[0]!);
      const id = await this.getChainId();
      const unsupported = this.isChainUnsupported(id);

      return {
        account,
        chain: { id, unsupported }
      };
    } catch (error) {
      if (/user rejected/i.test((error as ProviderRpcError)?.message)) {
        throw new UserRejectedRequestError(error as Error);
      }
      throw error;
    }
  }

  async disconnect() {
    const provider = await this.getProvider();
    try {
      await provider.disconnect();
    } catch (error) {
      if (!/No matching key/i.test((error as Error).message)) throw error;
    } finally {
      this._removeListeners();
      this._setRequestedChainsIds([]);
    }
  }

  async getAccount() {
    const { accounts } = await this.getProvider();

    return getAddress(accounts[0]!);
  }

  async getChainId() {
    const { chainId } = await this.getProvider();

    return chainId;
  }

  async getProvider({ chainId }: { chainId?: number } = {}) {
    if (!this._provider) await this._createProvider();
    if (chainId) await this.switchChain(chainId);

    return this._provider!;
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<WalletClient> {
    const [provider, account] = await Promise.all([
      this.getProvider({ chainId }),
      this.getAccount()
    ]);
    const chain = this.chains.find(x => x.id === chainId);
    if (!provider) throw new Error('provider is required.');

    //@ts-ignore - TODO
    return createWalletClient({
      account,
      chain,
      transport: custom(provider)
    });
  }

  async isAuthorized() {
    try {
      const [account, provider] = await Promise.all([this.getAccount(), this.getProvider()]);
      const isChainsStale = await this._isChainsStale();

      // If an account does not exist on the session, then the connector is unauthorized.
      if (!account) return false;

      // If the chains are stale on the session, then the connector is unauthorized.
      if (isChainsStale && provider.session) {
        try {
          await provider.disconnect();
        } catch {}

        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  override async switchChain(chainId: number) {
    const chain = this.chains.find(_chain => _chain.id === chainId);
    if (!chain) throw new SwitchChainError(new Error('chain not found on connector.'));

    try {
      const provider = await this.getProvider();
      const namespaceChains = this._getNamespaceChainsIds();
      const namespaceMethods = this._getNamespaceMethods();
      const isChainApproved = namespaceChains.includes(chainId);

      if (!isChainApproved && namespaceMethods.includes(ADD_ETH_CHAIN_METHOD)) {
        await provider.request({
          method: ADD_ETH_CHAIN_METHOD,
          params: [
            {
              chainId: numberToHex(chain.id),
              blockExplorerUrls: [chain.blockExplorers?.default?.url],
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [...chain.rpcUrls.default.http]
            }
          ]
        });
        const requestedChains = await this._getRequestedChainsIds();
        requestedChains.push(chainId);
        this._setRequestedChainsIds(requestedChains);
      }
      await provider.request({
        method: SWITCH_ETH_CHAIN_METHOD,
        params: [{ chainId: numberToHex(chainId) }]
      });

      return chain;
    } catch (error) {
      const message = typeof error === 'string' ? error : (error as ProviderRpcError)?.message;
      if (/user rejected request/i.test(message)) {
        throw new UserRejectedRequestError(error as Error);
      }
      throw new SwitchChainError(error as Error);
    }
  }

  async _createProvider() {
    if (!this._initProviderPromise) {
      this._initProviderPromise = this._initProvider();
    }

    return this._initProviderPromise;
  }

  async _initProvider() {
    const [defaultChain, ...optionalChains] = this.chains.map(({ id }) => id);
    if (defaultChain) {
      const { projectId, showQrModal = true, qrModalOptions, metadata, relayUrl } = this.options;
      this._provider = await EthereumProvider.init({
        showQrModal,
        qrModalOptions,
        projectId,
        optionalMethods: OPTIONAL_METHODS,
        optionalEvents: OPTIONAL_EVENTS,
        chains: [defaultChain],
        optionalChains: optionalChains.length ? optionalChains : undefined,
        rpcMap: Object.fromEntries(
          this.chains.map(chain => [chain.id, chain.rpcUrls.default.http[0]!])
        ),
        metadata,
        relayUrl
      });
    }
  }

  /**
   * Checks if the target chains match the chains that were
   * initially requested by the connector for the WalletConnect session.
   * If there is a mismatch, this means that the chains on the connector
   * are considered stale, and need to be revalidated at a later point (via
   * connection).
   *
   * There may be a scenario where a dapp adds a chain to the
   * connector later on, however, this chain will not have been approved or rejected
   * by the wallet. In this case, the chain is considered stale.
   *
   * There are exceptions however:
   * -  If the wallet supports dynamic chain addition via `eth_addEthereumChain`,
   *    then the chain is not considered stale.
   * -  If the `isNewChainsStale` flag is falsy on the connector, then the chain is
   *    not considered stale.
   *
   * For the above cases, chain validation occurs dynamically when the user
   * attempts to switch chain.
   *
   * Also check that dapp supports at least 1 chain from previously approved session.
   */
  async _isChainsStale() {
    const namespaceMethods = this._getNamespaceMethods();
    if (namespaceMethods.includes(ADD_ETH_CHAIN_METHOD)) return false;
    if (!this.options.isNewChainsStale) return false;

    const requestedChains = await this._getRequestedChainsIds();
    const connectorChains = this.chains.map(({ id }) => id);
    const namespaceChains = this._getNamespaceChainsIds();

    if (namespaceChains.length && !namespaceChains.some(id => connectorChains.includes(id)))
      return false;

    return !connectorChains.every(id => requestedChains.includes(id));
  }

  _setupListeners() {
    if (!this._provider) return;
    this._removeListeners();
    this._provider.on('accountsChanged', this.onAccountsChanged);
    this._provider.on('chainChanged', this.onChainChanged);
    this._provider.on('disconnect', this.onDisconnect);
    this._provider.on('session_delete', this.onDisconnect);
    this._provider.on('display_uri', this.onDisplayUri);
    this._provider.on('connect', this.onConnect);
  }

  _removeListeners() {
    if (!this._provider) return;
    this._provider.removeListener('accountsChanged', this.onAccountsChanged);
    this._provider.removeListener('chainChanged', this.onChainChanged);
    this._provider.removeListener('disconnect', this.onDisconnect);
    this._provider.removeListener('session_delete', this.onDisconnect);
    this._provider.removeListener('display_uri', this.onDisplayUri);
    this._provider.removeListener('connect', this.onConnect);
  }

  _setRequestedChainsIds(chains: number[]) {
    StorageUtils.setItem(REQUESTED_CHAINS_KEY, chains);
  }

  async _getRequestedChainsIds(): Promise<number[]> {
    const requestedChains = await StorageUtils.getItem<number[]>(REQUESTED_CHAINS_KEY);

    return requestedChains || [];
  }

  _getNamespaceChainsIds() {
    if (!this._provider) return [];
    const namespaces = this._provider.session?.namespaces;
    if (!namespaces) return [];

    const normalizedNamespaces = normalizeNamespaces(namespaces);
    const chainIds = normalizedNamespaces[NAMESPACE]?.chains?.map(chain =>
      parseInt(chain.split(':')[1] || '')
    );

    return chainIds ?? [];
  }

  _getNamespaceMethods() {
    if (!this._provider) return [];
    const namespaces = this._provider.session?.namespaces;
    if (!namespaces) return [];

    const normalizedNamespaces = normalizeNamespaces(namespaces);
    const methods = normalizedNamespaces[NAMESPACE]?.methods;

    return methods ?? [];
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0]!) });
  };

  protected onChainChanged = (chainId: number | string) => {
    const id = Number(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  protected onDisconnect = () => {
    this._setRequestedChainsIds([]);
    this.emit('disconnect');
  };

  protected onDisplayUri = (uri: string) => {
    this.emit('message', { type: 'display_uri', data: uri });
  };

  protected onConnect = () => {
    this.emit('connect', {});
  };
}
