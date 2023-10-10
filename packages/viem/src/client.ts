import '@walletconnect/react-native-compat';
import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  LibraryOptions,
  NetworkControllerClient,
  PublicStateControllerState,
  Token
} from '@web3modal/scaffold-react-native';
import { Web3ModalScaffold } from '@web3modal/scaffold-react-native';
import { ADD_CHAIN_METHOD, NAMESPACE, SWITCH_CHAIN_METHOD, VERSION } from './utils/constants';
import { caipNetworkIdToNumber, getCaipDefaultChain, getCaipTokens } from './utils/helpers';
import { NetworkImageIds } from './utils/presets';
import {
  type Chain,
  custom,
  createPublicClient,
  type Address,
  SwitchChainError,
  numberToHex,
  ProviderRpcError,
  UserRejectedRequestError,
  getAddress
} from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import {
  EthereumProvider,
  OPTIONAL_EVENTS,
  OPTIONAL_METHODS,
  type EthereumProviderOptions
} from '@walletconnect/ethereum-provider';
import type WalletConnectProvider from '@walletconnect/ethereum-provider';
import { normalizeNamespaces } from '@walletconnect/utils';
import { fetchBalance } from './wagmiCore/actions/accounts/fetchBalance';

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  metadata: EthereumProviderOptions['metadata'];
  chains?: Chain[];
  defaultChain?: Chain;
  chainImages?: Record<number, string>;
  tokens?: Record<number, Token>;
  relayUrl?: string;
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>;

// @ts-expect-error: Overriden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined;
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  public provider?: WalletConnectProvider;

  private hasSyncedConnectedAccount = false;
  private isConnected = false;

  private options: Web3ModalClientOptions | undefined = undefined;

  public constructor(options: Web3ModalClientOptions) {
    const { chains, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } = options;

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined');
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = caipNetworkIdToNumber(caipNetwork?.id);
        const chain = chains?.find(_chain => _chain.id === chainId);
        if (!chain || !chainId) {
          throw new Error('networkControllerClient:switchCaipNetwork - chain not found');
        }
        await this.switchChain(chain.id);
      },

      getApprovedCaipNetworksData: async () => {
        const provider = await this.getProvider();
        if (!provider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined');
        }

        const ns = provider.signer?.session?.namespaces;
        const nsMethods = ns?.[NAMESPACE]?.methods;
        const nsChains = ns?.[NAMESPACE]?.chains;

        return {
          supportsAllNetworks: nsMethods?.includes(ADD_CHAIN_METHOD) ?? true,
          approvedCaipNetworkIds: nsChains as CaipNetworkId[]
        };
      }
    };

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const onDisplayUri = (uri: string) => {
          onUri(uri);
          provider.removeListener('display_uri', onDisplayUri);
        };

        const provider = await this.getProvider();

        let defaultChainId = defaultChain?.id ?? chains?.[0]?.id ?? mainnet.id;

        const optionalChains = this.getChains().filter(chain => chain.id !== defaultChainId);

        if (!provider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined');
        }

        provider.on('display_uri', onDisplayUri);
        this.setupListeners();

        await provider.connect({
          chains: [defaultChainId],
          optionalChains: optionalChains?.length
            ? optionalChains?.map(chain => chain.id)
            : undefined
        });
      },

      disconnect: async () => {
        const provider = await this.getProvider();
        await provider.disconnect();
        this.onDisconnect();
      }
    };

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `react-native-viem-${VERSION}`,
      ...w3mOptions
    });

    this.options = options;
    this.initProvider();

    this.syncRequestedNetworks(chains, chainImages);

    this.subscribeConnection(isConnected => {
      if (isConnected !== this.isConnected) {
        this.isConnected = isConnected;
        this.syncAccount();
        this.syncNetwork();
      }
    });
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState();

    return {
      ...state,
      selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
    };
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: caipNetworkIdToNumber(state.selectedNetworkId)
      })
    );
  }

  // -- Private -----------------------------------------------------------------
  private async initProvider() {
    if (!this.options) return;

    const { projectId, metadata, relayUrl } = this.options;
    const chains = this.getChains();
    const [defaultChain, ...optionalChains] = chains;

    try {
      this.provider = await EthereumProvider.init({
        projectId,
        chains: [defaultChain?.id || mainnet.id],
        optionalChains: optionalChains?.map(({ id }) => id) || [],
        showQrModal: false,
        optionalMethods: OPTIONAL_METHODS,
        optionalEvents: OPTIONAL_EVENTS,
        rpcMap: chains
          ? Object.fromEntries(chains.map(chain => [chain.id, chain.rpcUrls.default.http[0]!]))
          : undefined,
        metadata,
        relayUrl
      });

      this.setupListeners();

      if (this.provider.session) {
        this.setIsConnected(true);
      }
    } catch (error) {
      throw new Error('Web3Modal:initProvider - error initializing provider');
    }
  }

  private async getProvider() {
    if (!this.provider) await this.initProvider();

    return this.provider!;
  }

  private async getPublicClient() {
    const chainId = await this.getChainId();
    const chain = this.getChains().find(_chain => _chain.id === chainId);

    return createPublicClient({
      chain,
      transport: custom(await this.getProvider())
    });
  }

  private async getChainId() {
    const provider = await this.getProvider();
    const chainId = await provider.request<number>({ method: 'eth_chainId' });

    return chainId;
  }

  async getAccount() {
    const { accounts } = await this.getProvider();

    return getAddress(accounts[0]!);
  }

  async switchChain(chainId: number) {
    const chain = this.options?.chains?.find(_chain => _chain.id === chainId);
    if (!chain) throw new SwitchChainError(new Error('chain not found on connector.'));

    try {
      const provider = await this.getProvider();
      const namespaceChains = this.getNamespaceChainsIds();
      const namespaceMethods = this.getNamespaceMethods();
      const isChainApproved = namespaceChains.includes(chainId);

      if (!isChainApproved && namespaceMethods.includes(ADD_CHAIN_METHOD)) {
        await provider.request({
          method: ADD_CHAIN_METHOD,
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
      } else {
        await provider.request({
          method: SWITCH_CHAIN_METHOD,
          params: [{ chainId: numberToHex(chainId) }]
        });
      }

      return chain;
    } catch (error) {
      const message = typeof error === 'string' ? error : (error as ProviderRpcError)?.message;
      if (/user rejected request/i.test(message)) {
        throw new UserRejectedRequestError(error as Error);
      }
      throw new SwitchChainError(error as Error);
    }
  }

  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${NAMESPACE}:${chain.id}`,
          name: chain.name,
          imageId: NetworkImageIds[chain.id],
          imageUrl: chainImages?.[chain.id]
        }) as CaipNetwork
    );
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? []);
  }

  private async syncAccount() {
    if (this.isConnected) {
      const address = await this.getAccount();
      const chainId = await this.getChainId();
      if (address && chainId) {
        const caipAddress: CaipAddress = `${NAMESPACE}:${chainId}:${address}`;
        this.setCaipAddress(caipAddress);
        await Promise.all([
          this.syncProfile(address),
          this.syncBalance(address, chainId),
          this.getApprovedCaipNetworksData()
        ]);
        this.hasSyncedConnectedAccount = true;
      }
    } else if (this.hasSyncedConnectedAccount) {
      this.hasSyncedConnectedAccount = false;
      this.resetAccount();
      this.resetWcConnection();
      this.resetNetwork();
    }
  }

  private async syncNetwork() {
    if (this.isConnected) {
      const address = await this.getAccount();
      const chainId = await this.getChainId();
      const chain = this.getChains().find(_chain => _chain.id === chainId);

      if (chain) {
        const caipChainId: CaipNetworkId = `${NAMESPACE}:${chain.id}`;
        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: NetworkImageIds[chain.id],
          imageUrl: this.options?.chainImages?.[chain.id]
        });
        if (address) {
          const caipAddress: CaipAddress = `${NAMESPACE}:${chain.id}:${address}`;
          this.setCaipAddress(caipAddress);
          if (chain.blockExplorers?.default?.url) {
            const url = `${chain.blockExplorers.default.url}/address/${address}`;
            this.setAddressExplorerUrl(url);
          } else {
            this.setAddressExplorerUrl(undefined);
          }
          if (this.hasSyncedConnectedAccount) {
            await this.syncBalance(address, chain.id);
          }
        }
      }
    }
  }

  private async syncProfile(address: Address) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        caipChainId: `${NAMESPACE}:${mainnet.id}`,
        address
      });
      this.setProfileName(name);
      this.setProfileImage(avatar);
    } catch {
      const mainnetClient = createPublicClient({
        chain: mainnet,
        transport: custom(await this.getProvider())
      });

      const profileName = await mainnetClient.getEnsName({
        address
      });

      if (profileName) {
        this.setProfileName(profileName);
        const profileImage = await mainnetClient.getEnsAvatar({ name: normalize(profileName) });
        if (profileImage) {
          this.setProfileImage(profileImage);
        }
      }
    }
  }

  private async syncBalance(address: Address, chainId: number) {
    const publicClient = await this.getPublicClient();
    const chains = this.getChains();

    const balance = await fetchBalance({
      address,
      chainId,
      token: this.options?.tokens?.[chainId]?.address as Address,
      chains,
      publicClient
    });

    this.setBalance(balance.formatted, balance.symbol);
  }

  private getChains(): Chain[] {
    if (this.options?.defaultChain) {
      const defaultChain = this.options.defaultChain;
      const chains = this.options?.chains?.filter(chain => chain.id !== defaultChain.id) ?? [];

      return [defaultChain, ...chains];
    }

    return this.options?.chains ?? [mainnet];
  }

  private getNamespaceChainsIds() {
    if (!this.provider) return [];
    const namespaces = this.provider.session?.namespaces;
    if (!namespaces) return [];

    const normalizedNamespaces = normalizeNamespaces(namespaces);
    const chainIds = normalizedNamespaces[NAMESPACE]?.chains?.map(chain =>
      parseInt(chain.split(':')[1] || '')
    );

    return chainIds ?? [];
  }

  private getNamespaceMethods() {
    if (!this.provider) return [];
    const namespaces = this.provider.session?.namespaces;
    if (!namespaces) return [];

    const normalizedNamespaces = normalizeNamespaces(namespaces);
    const methods = normalizedNamespaces[NAMESPACE]?.methods;

    return methods ?? [];
  }

  private setupListeners() {
    this.provider?.on('chainChanged', this.onChainChanged.bind(this));
    this.provider?.on('disconnect', this.onDisconnect.bind(this));
  }

  private removeListeners() {
    this.provider?.removeListener('chainChanged', this.onChainChanged.bind(this));
    this.provider?.removeListener('disconnect', this.onDisconnect.bind(this));
  }

  private async onChainChanged(chainId: string) {
    const chainNumber = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
    const clientChainId = await this.getChainId();
    const provider = await this.getProvider();

    // Some wallets send wrong chains, so we need to check if the provider chain is correct
    if (clientChainId !== chainNumber) {
      await provider.request({
        method: SWITCH_CHAIN_METHOD,
        params: [{ chainId }]
      });
    }
    this.syncAccount();
    this.syncNetwork();
  }

  private async onDisconnect() {
    this.setIsConnected(false);
    this.removeListeners();
  }
}
