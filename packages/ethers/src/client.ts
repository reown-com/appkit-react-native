import type {
  CaipAddress,
  CaipNetwork,
  CaipNetworkId,
  ConnectionControllerClient,
  Connector,
  LibraryOptions,
  NetworkControllerClient,
  PublicStateControllerState,
  Token
} from '@web3modal/scaffold-react-native';
import { InfuraProvider, JsonRpcProvider, formatEther, getAddress } from 'ethers';
import { Web3ModalScaffold } from '@web3modal/scaffold-react-native';
import {
  ConstantsUtil,
  PresetsUtil,
  HelpersUtil,
  StorageUtil
} from '@web3modal/scaffold-utils-react-native';
import EthereumProvider from '@walletconnect/ethereum-provider';
import type {
  Address,
  Metadata,
  ProviderType,
  Chain,
  Provider,
  EthersStoreUtilState
} from '@web3modal/scaffold-utils-react-native';
import {
  EthersConstantsUtil,
  EthersHelpersUtil,
  EthersStoreUtil
} from '@web3modal/scaffold-utils-react-native';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider';

// -- Types ---------------------------------------------------------------------
export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  config: ProviderType;
  chains: Chain[];
  defaultChain?: Chain;
  chainImages?: Record<number, string>;
  connectorImages?: Record<string, string>;
  tokens?: Record<number, Token>;
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>;

// @ts-expect-error: Overriden state type is correct
interface Web3ModalState extends PublicStateControllerState {
  selectedNetworkId: number | undefined;
}

interface ExternalProvider extends EthereumProvider {
  address?: string;
}

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false;

  private walletConnectProvider?: EthereumProvider;

  private walletConnectProviderInitPromise?: Promise<void>;

  private projectId: string;

  private chains: Chain[];

  private metadata?: Metadata;

  private options: Web3ModalClientOptions | undefined = undefined;

  public constructor(options: Web3ModalClientOptions) {
    const { config, chains, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } =
      options;

    if (!config) {
      throw new Error('web3modal:constructor - config is undefined');
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined');
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id);
        if (chainId) {
          try {
            await this.switchNetwork(chainId);
          } catch (error) {
            EthersStoreUtil.setError(error);
          }
        }
      },

      getApprovedCaipNetworksData: async () =>
        new Promise(async resolve => {
          const walletChoice = await StorageUtil.getConnectedConnector();
          const walletConnectType =
            PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
          if (walletChoice?.includes(walletConnectType)) {
            const provider = await this.getWalletConnectProvider();
            if (!provider) {
              throw new Error(
                'networkControllerClient:getApprovedCaipNetworks - provider is undefined'
              );
            }
            const ns = provider.signer?.session?.namespaces;
            const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
            const nsChains = ns?.[ConstantsUtil.EIP155]?.chains;

            const result = {
              supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
              approvedCaipNetworkIds: nsChains as CaipNetworkId[] | undefined
            };

            resolve(result);
          } else {
            const result = {
              approvedCaipNetworkIds: undefined,
              supportsAllNetworks: true
            };

            resolve(result);
          }
        })
    };

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
        const WalletConnectProvider = await this.getWalletConnectProvider();
        if (!WalletConnectProvider) {
          throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined');
        }

        WalletConnectProvider.on('display_uri', (uri: string) => {
          onUri(uri);
        });

        await WalletConnectProvider.connect();
        await this.setWalletConnectProvider();
      },

      //  @ts-expect-error TODO expected types in arguments are incomplete
      connectExternal: async ({ id }: { id: string; provider: Provider }) => {
        if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          const CoinbaseProvider = config.coinbase;
          if (!CoinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined');
          }

          try {
            await CoinbaseProvider.request({ method: 'eth_requestAccounts' });
            await this.setCoinbaseProvider(config);
          } catch (error) {
            EthersStoreUtil.setError(error);
          }
        }
      },

      disconnect: async () => {
        const provider = EthersStoreUtil.state.provider;
        const providerType = EthersStoreUtil.state.providerType;
        const walletConnectType =
          PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
        if (providerType === walletConnectType) {
          const WalletConnectProvider = provider;
          await (WalletConnectProvider as unknown as EthereumProvider).disconnect();
        } else if (provider) {
          provider.emit('disconnect');
        }
        StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
        EthersStoreUtil.reset();
      },

      signMessage: async (message: string) => {
        const provider = EthersStoreUtil.state.provider;
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined');
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, this.getAddress()]
        });

        return signature as `0x${string}`;
      }
    };

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: EthersHelpersUtil.getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `react-native-ethers5-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    });

    this.options = options;

    this.metadata = config.metadata;

    this.projectId = w3mOptions.projectId;
    this.chains = chains;

    this.createProvider();

    EthersStoreUtil.subscribeKey('address', () => {
      this.syncAccount();
    });

    EthersStoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages);
    });

    this.syncRequestedNetworks(chains, chainImages);
    this.syncConnectors(config);

    if (config.coinbase) {
      this.checkActiveCoinbaseProvider(config);
    }
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState();

    return {
      ...state,
      selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    };
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: HelpersUtil.caipNetworkIdToNumber(state.selectedNetworkId)
      })
    );
  }

  public setAddress(address?: string) {
    const originalAddress = address ? (getAddress(address) as Address) : undefined;
    EthersStoreUtil.setAddress(originalAddress);
  }

  public getAddress() {
    const { address } = EthersStoreUtil.state;

    return address ? getAddress(address) : address;
  }

  public getError() {
    return EthersStoreUtil.state.error;
  }

  public getChainId() {
    return EthersStoreUtil.state.chainId;
  }

  public getIsConnected() {
    return EthersStoreUtil.state.isConnected;
  }

  public getWalletProvider() {
    return EthersStoreUtil.state.provider;
  }

  public getWalletProviderType() {
    return EthersStoreUtil.state.providerType;
  }

  public subscribeProvider(callback: (newState: EthersStoreUtilState) => void) {
    return EthersStoreUtil.subscribe(callback);
  }

  public async disconnect() {
    const { provider } = EthersStoreUtil.state;
    StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
    EthersStoreUtil.reset();

    await (provider as unknown as EthereumProvider).disconnect();
  }

  // -- Private -----------------------------------------------------------------
  private createProvider() {
    if (!this.walletConnectProviderInitPromise) {
      this.walletConnectProviderInitPromise = this.initWalletConnectProvider();
    }

    return this.walletConnectProviderInitPromise;
  }

  private async initWalletConnectProvider() {
    const walletConnectProviderOptions: EthereumProviderOptions = {
      projectId: this.projectId,
      showQrModal: false,
      rpcMap: this.chains
        ? this.chains.reduce<Record<number, string>>((map, chain) => {
            map[chain.chainId] = chain.rpcUrl;

            return map;
          }, {})
        : ({} as Record<number, string>),
      optionalChains: [...this.chains.map(chain => chain.chainId)] as [number],
      metadata: this.metadata
    };

    this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions);

    await this.checkActiveWalletConnectProvider();
  }

  private async getWalletConnectProvider() {
    if (!this.walletConnectProvider) {
      try {
        await this.createProvider();
      } catch (error) {
        EthersStoreUtil.setError(error);
      }
    }

    return this.walletConnectProvider;
  }

  private syncRequestedNetworks(
    chains: Web3ModalClientOptions['chains'],
    chainImages?: Web3ModalClientOptions['chainImages']
  ) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        }) as CaipNetwork
    );
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? []);
  }

  private async checkActiveWalletConnectProvider() {
    const WalletConnectProvider = await this.getWalletConnectProvider();
    const walletId = await StorageUtil.getItem(EthersConstantsUtil.WALLET_ID);

    if (WalletConnectProvider) {
      if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
        await this.setWalletConnectProvider();
      }
    }
  }

  private async checkActiveCoinbaseProvider(config: ProviderType) {
    const CoinbaseProvider = config.coinbase as unknown as ExternalProvider;
    const walletId = await StorageUtil.getItem(EthersConstantsUtil.WALLET_ID);

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        if (CoinbaseProvider.address) {
          await this.setCoinbaseProvider(config);
          await this.watchCoinbase(config);
        } else {
          await StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
          EthersStoreUtil.reset();
        }
      }
    }
  }

  private async setWalletConnectProvider() {
    StorageUtil.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID);
    const WalletConnectProvider = await this.getWalletConnectProvider();
    if (WalletConnectProvider) {
      const providerType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
      EthersStoreUtil.setChainId(WalletConnectProvider.chainId);
      EthersStoreUtil.setProviderType(providerType);
      EthersStoreUtil.setProvider(WalletConnectProvider as unknown as Provider);
      EthersStoreUtil.setIsConnected(true);
      this.setAddress(WalletConnectProvider.accounts?.[0]);
      await this.watchWalletConnect();
    }
  }

  private async setCoinbaseProvider(config: ProviderType) {
    await StorageUtil.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID);
    const CoinbaseProvider = config.coinbase;

    if (CoinbaseProvider) {
      const { address, chainId } = await EthersHelpersUtil.getUserInfo(CoinbaseProvider);
      if (address && chainId) {
        const providerType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.COINBASE_CONNECTOR_ID];
        EthersStoreUtil.setChainId(chainId);
        EthersStoreUtil.setProviderType(providerType);
        EthersStoreUtil.setProvider(config.coinbase);
        EthersStoreUtil.setIsConnected(true);
        this.setAddress(address);
        await this.watchCoinbase(config);
      }
    }
  }

  private async watchWalletConnect() {
    const WalletConnectProvider = await this.getWalletConnectProvider();

    function disconnectHandler() {
      StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
      EthersStoreUtil.reset();

      WalletConnectProvider?.removeListener('disconnect', disconnectHandler);
      WalletConnectProvider?.removeListener('accountsChanged', accountsChangedHandler);
      WalletConnectProvider?.removeListener('chainChanged', chainChangedHandler);
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        const chain = EthersHelpersUtil.hexStringToNumber(chainId);
        EthersStoreUtil.setChainId(chain);
      }
    }

    const accountsChangedHandler = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await this.setWalletConnectProvider();
      }
    };

    if (WalletConnectProvider) {
      WalletConnectProvider.on('disconnect', disconnectHandler);
      WalletConnectProvider.on('accountsChanged', accountsChangedHandler);
      WalletConnectProvider.on('chainChanged', chainChangedHandler);
    }
  }

  private async watchCoinbase(config: ProviderType) {
    const CoinbaseProvider = config.coinbase;
    const walletId = await StorageUtil.getItem(EthersConstantsUtil.WALLET_ID);

    function disconnectHandler() {
      StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
      EthersStoreUtil.reset();

      CoinbaseProvider?.removeListener('disconnect', disconnectHandler);
      CoinbaseProvider?.removeListener('accountsChanged', accountsChangedHandler);
      CoinbaseProvider?.removeListener('chainChanged', chainChangedHandler);
    }

    function accountsChangedHandler(accounts: string[]) {
      if (accounts.length === 0) {
        StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
        EthersStoreUtil.reset();
      } else {
        EthersStoreUtil.setAddress(accounts[0] as Address);
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId && walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        const chain = Number(chainId);
        EthersStoreUtil.setChainId(chain);
      }
    }

    if (CoinbaseProvider) {
      CoinbaseProvider.on('disconnect', disconnectHandler);
      CoinbaseProvider.on('accountsChanged', accountsChangedHandler);
      CoinbaseProvider.on('chainChanged', chainChangedHandler);
    }
  }

  private async syncAccount() {
    const address = EthersStoreUtil.state.address;
    const chainId = EthersStoreUtil.state.chainId;
    const isConnected = EthersStoreUtil.state.isConnected;

    this.resetAccount();
    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;

      this.setIsConnected(isConnected);

      this.setCaipAddress(caipAddress);

      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address),
        this.getApprovedCaipNetworksData()
      ]);
      this.hasSyncedConnectedAccount = true;
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection();
      this.resetNetwork();
    }
  }

  private async syncNetwork(chainImages?: Web3ModalClientOptions['chainImages']) {
    const address = EthersStoreUtil.state.address;
    const chainId = EthersStoreUtil.state.chainId;
    const isConnected = EthersStoreUtil.state.isConnected;
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId);

      if (chain) {
        const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chain.chainId}`;

        this.setCaipNetwork({
          id: caipChainId,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
          imageUrl: chainImages?.[chain.chainId]
        });
        if (isConnected && address) {
          const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
          this.setCaipAddress(caipAddress);
          if (chain.explorerUrl) {
            const url = `${chain.explorerUrl}/address/${address}`;
            this.setAddressExplorerUrl(url);
          } else {
            this.setAddressExplorerUrl(undefined);
          }

          if (this.hasSyncedConnectedAccount) {
            await this.syncBalance(address);
          }
        }
      }
    }
  }

  private async syncProfile(address: Address) {
    const chainId = EthersStoreUtil.state.chainId;

    if (chainId === 1) {
      const ensProvider = new InfuraProvider('mainnet');
      const name = await ensProvider.lookupAddress(address);
      const avatar = await ensProvider.getAvatar(address);

      if (name) {
        this.setProfileName(name);
      }
      if (avatar) {
        this.setProfileImage(avatar);
      }
    } else {
      this.setProfileName(undefined);
      this.setProfileImage(undefined);
    }
  }

  private async syncBalance(address: Address) {
    const chainId = EthersStoreUtil.state.chainId;
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId);

      if (chain) {
        const jsonRpcProvider = new JsonRpcProvider(chain.rpcUrl, {
          chainId,
          name: chain.name
        });
        if (jsonRpcProvider) {
          const balance = await jsonRpcProvider.getBalance(address);
          const formattedBalance = formatEther(balance);
          this.setBalance(formattedBalance, chain.currency);
        }
      }
    }
  }

  private async switchNetwork(chainId: number) {
    const provider = EthersStoreUtil.state.provider;
    const providerType = EthersStoreUtil.state.providerType;
    if (this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId);

      const walletConnectType =
        PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];

      const coinbaseType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.COINBASE_CONNECTOR_ID];

      if (providerType === walletConnectType && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider;

        if (WalletConnectProvider) {
          try {
            const ns = WalletConnectProvider.signer?.session?.namespaces;
            const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
            const nsChains = this.getChainsIds(ns?.[ConstantsUtil.EIP155]?.chains);

            const isChainApproved = nsChains.includes(chainId);

            if (!isChainApproved && nsMethods?.includes('wallet_addEthereumChain')) {
              await EthersHelpersUtil.addEthereumChain(
                WalletConnectProvider as unknown as Provider,
                chain
              );
            }

            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            });

            EthersStoreUtil.setChainId(chainId);
          } catch (switchError: any) {
            throw new Error('Chain is not supported');
          }
        }
      } else if (providerType === coinbaseType && chain) {
        const CoinbaseProvider = provider;
        if (CoinbaseProvider) {
          try {
            await CoinbaseProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            });
            EthersStoreUtil.setChainId(chain.chainId);
          } catch (switchError: any) {
            if (
              switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
              switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
              switchError?.data?.originalError?.code ===
                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
            ) {
              await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain);
            }
          }
        }
      }
    }
  }

  private syncConnectors(config: ProviderType) {
    const w3mConnectors: Connector[] = [];

    const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
    if (connectorType) {
      w3mConnectors.push({
        id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
        type: connectorType
      });
    }

    const coinbaseType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.COINBASE_CONNECTOR_ID];
    if (config.coinbase && coinbaseType) {
      w3mConnectors.push({
        id: ConstantsUtil.COINBASE_CONNECTOR_ID,
        explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
        imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_CONNECTOR_ID],
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
        type: coinbaseType
      });
    }

    this.setConnectors(w3mConnectors);
  }

  private getChainsIds(chains?: string[]) {
    if (!chains) return [];
    const chainIds = chains?.map(chain => parseInt(chain.split(':')[1] || ''));

    return chainIds ?? [];
  }
}
