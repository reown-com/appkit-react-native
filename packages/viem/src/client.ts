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
import { ADD_CHAIN_METHOD, NAMESPACE, VERSION } from './utils/constants';
import { caipNetworkIdToNumber, getCaipDefaultChain, getCaipTokens } from './utils/helpers';
import { NetworkImageIds } from './utils/presets';
import {
  type Chain,
  createWalletClient,
  custom,
  createPublicClient,
  type WalletClient,
  type PublicClient,
  type Address
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
  public client?: WalletClient;
  public publicClient?: PublicClient;

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
        await this.switchNetwork(chain.id);
        this.syncAccount();
        this.syncNetwork(chainImages);
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
        const selectedChainId = caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        let defaultChainId = selectedChainId;
        if (!defaultChainId) {
          defaultChainId = defaultChain?.id ?? chains?.[0]?.id ?? mainnet.id;
        }

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
        this.syncNetwork(chainImages);
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

  private async getClient() {
    if (!this.client) {
      const provider = await this.getProvider();
      const [chain] = this.getChains();
      this.client = createWalletClient({
        chain,
        transport: custom(provider)
      });
    }

    return this.client;
  }

  private async getPublicClient() {
    if (!this.publicClient) {
      const provider = await this.getProvider();
      const [chain] = this.getChains();
      this.publicClient = createPublicClient({
        chain,
        transport: custom(provider)
      });
    }

    return this.publicClient;
  }

  private async switchNetwork(chainId: number) {
    const client = await this.getClient();
    try {
      await client.switchChain({ id: chainId });
    } catch (error) {
      const newChain = this.getChains().find(c => c.id !== chainId);
      await client.addChain({ chain: newChain! });
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
      const client = await this.getClient();
      const [address] = await client.getAddresses();
      const chainId = await client.getChainId();
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

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    if (this.isConnected) {
      const client = await this.getClient();
      const [address] = await client.getAddresses();
      const chainId = await client.getChainId();
      const chain = this.getChains().find(_chain => _chain.id === chainId);

      if (chain) {
        const caipChainId: CaipNetworkId = `${NAMESPACE}:${chain.id}`;
        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: NetworkImageIds[chain.id],
          imageUrl: chainImages?.[chain.id]
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
    const publicClient = await this.getPublicClient();
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
        const profileImage = await publicClient.getEnsAvatar({ name: normalize(profileName) });
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
    const clientChainId = await this.client?.getChainId();
    if (clientChainId !== chainNumber) {
      await this?.switchNetwork(chainNumber);
    }

    this.syncAccount();
    this.syncNetwork(this.options?.chainImages);
  }

  private async onDisconnect() {
    this.setIsConnected(false);
    this.client = undefined;
    this.publicClient = undefined;
    this.removeListeners();
  }
}
