import {
  BrowserProvider,
  Contract,
  InfuraProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  formatEther,
  formatUnits,
  getAddress,
  hexlify,
  isHexString,
  parseUnits,
  toUtf8Bytes
} from 'ethers';
import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ConnectionControllerClient,
  type Connector,
  type LibraryOptions,
  type NetworkControllerClient,
  type PublicStateControllerState,
  type SendTransactionArgs,
  type Token,
  AppKitScaffold,
  type WriteContractArgs,
  type AppKitFrameAccountType
} from '@reown/appkit-scaffold-react-native';
import { erc20ABI, NamesUtil, NetworkUtil } from '@reown/appkit-common-react-native';
import {
  ConstantsUtil,
  PresetsUtil,
  HelpersUtil,
  StorageUtil,
  EthersConstantsUtil,
  EthersHelpersUtil,
  EthersStoreUtil,
  type Address,
  type Metadata,
  type ProviderType,
  type Chain,
  type Provider,
  type EthersStoreUtilState,
  type CombinedProviderType,
  type AppKitFrameProvider
} from '@reown/appkit-scaffold-utils-react-native';
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider';

import { getAuthCaipNetworks, getWalletConnectCaipNetworks } from './utils/helpers';
import type { AppKitSIWEClient } from '@reown/appkit-siwe-react-native';

// -- Types ---------------------------------------------------------------------
export interface AppKitClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  config: ProviderType;
  siweConfig?: AppKitSIWEClient;
  chains: Chain[];
  defaultChain?: Chain;
  chainImages?: Record<number, string>;
  connectorImages?: Record<string, string>;
  tokens?: Record<number, Token>;
}

export type AppKitOptions = Omit<AppKitClientOptions, '_sdkVersion'>;

// @ts-expect-error: Overriden state type is correct
interface AppKitState extends PublicStateControllerState {
  selectedNetworkId: number | undefined;
}

interface ExternalProvider extends EthereumProvider {
  address?: string;
}

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitScaffold {
  private hasSyncedConnectedAccount = false;

  private walletConnectProvider?: EthereumProvider;

  private walletConnectProviderInitPromise?: Promise<void>;

  private projectId: string;

  private chains: Chain[];

  private metadata: Metadata;

  private options: AppKitClientOptions | undefined = undefined;

  private authProvider?: AppKitFrameProvider;

  public constructor(options: AppKitClientOptions) {
    const {
      config,
      siweConfig,
      chains,
      defaultChain,
      tokens,
      chainImages,
      _sdkVersion,
      ...appKitOptions
    } = options;

    if (!config) {
      throw new Error('appkit:constructor - config is undefined');
    }

    if (!appKitOptions.projectId) {
      throw new Error('appkit:constructor - projectId is undefined');
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id);
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
            PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]!;

          const authType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID]!;
          if (walletChoice?.includes(walletConnectType)) {
            const provider = await this.getWalletConnectProvider();
            const result = getWalletConnectCaipNetworks(provider);

            resolve(result);
          } else if (walletChoice?.includes(authType)) {
            const result = getAuthCaipNetworks();
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

        // When connecting through walletconnect, we need to set the clientId in the store
        const clientId = await WalletConnectProvider.signer?.client?.core?.crypto?.getClientId();
        if (clientId) {
          this.setClientId(clientId);
        }

        // SIWE
        const params = await siweConfig?.getMessageParams?.();
        if (siweConfig?.options?.enabled && params && Object.keys(params).length > 0) {
          const { SIWEController, getDidChainId, getDidAddress } = await import(
            '@reown/appkit-siwe-react-native'
          );
          const result = await WalletConnectProvider.authenticate({
            nonce: await siweConfig.getNonce(),
            methods: OPTIONAL_METHODS,
            ...params
          });
          // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
          const signedCacao = result?.auths?.[0];
          if (signedCacao) {
            const { p, s } = signedCacao;
            const chainId = getDidChainId(p.iss);
            const address = getDidAddress(p.iss);

            try {
              // Kicks off verifyMessage and populates external states
              const message = WalletConnectProvider.signer.client.formatAuthMessage({
                request: p,
                iss: p.iss
              });

              await SIWEController.verifyMessage({
                message,
                signature: s.s,
                cacao: signedCacao
              });

              if (address && chainId) {
                const session = {
                  address,
                  chainId: parseInt(chainId, 10)
                };

                SIWEController.setSession(session);
                SIWEController.onSignIn?.(session);
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error verifying message', error);
              // eslint-disable-next-line no-console
              await WalletConnectProvider.disconnect().catch(console.error);
              // eslint-disable-next-line no-console
              await SIWEController.signOut().catch(console.error);
              throw error;
            }
          }
        } else {
          await WalletConnectProvider.connect();
        }

        await this.setWalletConnectProvider();
      },

      //  @ts-expect-error TODO expected types in arguments are incomplete
      connectExternal: async ({ id }: { id: string; provider: Provider }) => {
        // If connecting with something else than walletconnect, we need to clear the clientId in the store
        this.setClientId(null);

        if (id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          const coinbaseProvider = config.extraConnectors?.find(connector => connector.id === id);
          if (!coinbaseProvider) {
            throw new Error('connectionControllerClient:connectCoinbase - connector is undefined');
          }

          try {
            await coinbaseProvider.request({ method: 'eth_requestAccounts' });
            await this.setCoinbaseProvider(coinbaseProvider as Provider);
          } catch (error) {
            EthersStoreUtil.setError(error);
          }
        } else if (id === ConstantsUtil.AUTH_CONNECTOR_ID) {
          await this.setAuthProvider();
        }
      },

      disconnect: async () => {
        const provider = EthersStoreUtil.state.provider;
        const providerType = EthersStoreUtil.state.providerType;
        const walletConnectType =
          PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];

        const authType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID];

        if (siweConfig?.options?.signOutOnDisconnect) {
          const { SIWEController } = await import('@reown/appkit-siwe-react-native');
          await SIWEController.signOut();
        }

        if (providerType === walletConnectType) {
          const WalletConnectProvider = provider;
          await (WalletConnectProvider as unknown as EthereumProvider).disconnect();
        } else if (providerType === authType) {
          await this.authProvider?.disconnect();
        } else if (provider) {
          provider.emit('disconnect');
        }
        StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
        EthersStoreUtil.reset();
        this.setClientId(null);
      },

      signMessage: async (message: string) => {
        const provider = EthersStoreUtil.state.provider;
        if (!provider) {
          throw new Error('connectionControllerClient:signMessage - provider is undefined');
        }
        const hexMessage = isHexString(message) ? message : hexlify(toUtf8Bytes(message));
        const signature = await provider.request({
          method: 'personal_sign',
          params: [hexMessage, this.getAddress()]
        });

        return signature as `0x${string}`;
      },

      parseUnits: (value: string, decimals: number) => parseUnits(value, decimals),

      formatUnits: (value: bigint, decimals: number) => formatUnits(value, decimals),

      sendTransaction: async (data: SendTransactionArgs) => {
        const { chainId, provider, address } = EthersStoreUtil.state;

        if (!provider) {
          throw new Error('ethersClient:sendTransaction - provider is undefined');
        }

        if (!address) {
          throw new Error('ethersClient:sendTransaction - address is undefined');
        }

        const txParams = {
          to: data.to,
          value: data.value,
          gasLimit: data.gas,
          gasPrice: data.gasPrice,
          data: data.data,
          type: 0
        };

        const browserProvider = new BrowserProvider(provider, chainId);
        const signer = new JsonRpcSigner(browserProvider, address);
        const txResponse = await signer.sendTransaction(txParams);
        const txReceipt = await txResponse.wait();

        return (txReceipt?.hash as `0x${string}`) || null;
      },

      writeContract: async (data: WriteContractArgs) => {
        const { chainId, provider, address } = EthersStoreUtil.state;

        if (!provider) {
          throw new Error('ethersClient:writeContract - provider is undefined');
        }

        if (!address) {
          throw new Error('ethersClient:writeContract - address is undefined');
        }

        const browserProvider = new BrowserProvider(provider, chainId);
        const signer = new JsonRpcSigner(browserProvider, address);
        const contract = new Contract(data.tokenAddress, data.abi, signer);

        if (!contract || !data.method) {
          throw new Error('Contract method is undefined');
        }

        const method = contract[data.method];
        if (method) {
          const tx = await method(data.receiverAddress, data.tokenAmount);

          return tx;
        }

        throw new Error('Contract method is undefined');
      },

      getEnsAddress: async (value: string) => {
        try {
          const chainId = Number(this.getCaipNetwork()?.id);
          let ensName: string | null = null;
          let wcName: boolean | string = false;

          if (NamesUtil.isReownName(value)) {
            wcName = (await this?.resolveReownName(value)) || false;
          }

          // If on mainnet, fetch from ENS
          if (chainId === 1) {
            const ensProvider = new InfuraProvider('mainnet');
            ensName = await ensProvider.resolveName(value);
          }

          return ensName || wcName || false;
        } catch {
          return false;
        }
      },

      getEnsAvatar: async (value: string) => {
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id));
        if (chainId === 1) {
          const ensProvider = new InfuraProvider('mainnet');
          const avatar = await ensProvider.getAvatar(value);

          return avatar || false;
        }

        return false;
      }
    };

    super({
      networkControllerClient,
      connectionControllerClient,
      siweControllerClient: siweConfig,
      defaultChain: EthersHelpersUtil.getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `react-native-ethers-${ConstantsUtil.VERSION}`,
      ...appKitOptions
    });

    this.options = options;

    this.metadata = config.metadata;

    this.projectId = appKitOptions.projectId;
    this.chains = chains;

    this.createProvider();

    EthersStoreUtil.subscribeKey('address', address => {
      this.syncAccount({ address });
    });

    EthersStoreUtil.subscribeKey('chainId', () => {
      this.syncNetwork(chainImages);
    });

    this.syncRequestedNetworks(chains, chainImages);
    this.syncConnectors(config);
    this.syncAuthConnector(config);
  }

  // -- Public ------------------------------------------------------------------

  // @ts-expect-error: Overriden state type is correct
  public override getState() {
    const state = super.getState();

    return {
      ...state,
      selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
    };
  }

  // @ts-expect-error: Overriden state type is correct
  public override subscribeState(callback: (state: AppKitState) => void) {
    return super.subscribeState(state =>
      callback({
        ...state,
        selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
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
    this.setClientId(null);

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
    const rpcMap = this.chains
      ? this.chains.reduce<Record<number, string>>((map, chain) => {
          map[chain.chainId] = chain.rpcUrl;

          return map;
        }, {})
      : ({} as Record<number, string>);

    const walletConnectProviderOptions: EthereumProviderOptions = {
      projectId: this.projectId,
      showQrModal: false,
      rpcMap,
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
    chains: AppKitClientOptions['chains'],
    chainImages?: AppKitClientOptions['chainImages']
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

  private async checkActiveCoinbaseProvider(provider: Provider) {
    const CoinbaseProvider = provider as unknown as ExternalProvider;
    const walletId = await StorageUtil.getItem(EthersConstantsUtil.WALLET_ID);

    if (CoinbaseProvider) {
      if (walletId === ConstantsUtil.COINBASE_CONNECTOR_ID) {
        if (CoinbaseProvider.address) {
          await this.setCoinbaseProvider(provider);
          await this.watchCoinbase(provider);
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

  private async setCoinbaseProvider(provider: Provider) {
    await StorageUtil.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_CONNECTOR_ID);

    if (provider) {
      const { address, chainId } = await EthersHelpersUtil.getUserInfo(provider);
      if (address && chainId) {
        const providerType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.COINBASE_CONNECTOR_ID];
        EthersStoreUtil.setChainId(chainId);
        EthersStoreUtil.setProviderType(providerType);
        EthersStoreUtil.setProvider(provider);
        EthersStoreUtil.setIsConnected(true);
        this.setAddress(address);
        await this.watchCoinbase(provider);
      }
    }
  }

  private async setAuthProvider() {
    StorageUtil.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.AUTH_CONNECTOR_ID);

    if (this.authProvider) {
      const { address, chainId } = await this.authProvider.connect();
      super.setLoading(false);
      if (address && chainId) {
        EthersStoreUtil.setChainId(chainId);
        EthersStoreUtil.setProviderType(
          PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID]
        );
        EthersStoreUtil.setProvider(this.authProvider as CombinedProviderType);
        EthersStoreUtil.setIsConnected(true);
        EthersStoreUtil.setAddress(address as Address);
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

  private async watchCoinbase(provider: Provider) {
    const walletId = await StorageUtil.getItem(EthersConstantsUtil.WALLET_ID);

    function disconnectHandler() {
      StorageUtil.removeItem(EthersConstantsUtil.WALLET_ID);
      EthersStoreUtil.reset();

      provider?.removeListener('disconnect', disconnectHandler);
      provider?.removeListener('accountsChanged', accountsChangedHandler);
      provider?.removeListener('chainChanged', chainChangedHandler);
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

    if (provider) {
      provider.on('disconnect', disconnectHandler);
      provider.on('accountsChanged', accountsChangedHandler);
      provider.on('chainChanged', chainChangedHandler);
    }
  }

  private async syncAccount({ address }: { address?: Address }) {
    const chainId = EthersStoreUtil.state.chainId;
    const isConnected = EthersStoreUtil.state.isConnected;

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
      this.resetAccount();
      this.resetWcConnection();
      this.resetNetwork();
    }
  }

  private async syncNetwork(chainImages?: AppKitClientOptions['chainImages']) {
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

    try {
      const response = await this.fetchIdentity({ address });

      if (!response) {
        throw new Error('Couldnt fetch idendity');
      }

      this.setProfileName(response.name);
      this.setProfileImage(response.avatar);
    } catch {
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
  }

  private async syncBalance(address: Address) {
    const chainId = EthersStoreUtil.state.chainId;
    if (chainId && this.chains) {
      const chain = this.chains.find(c => c.chainId === chainId);
      const token = this.options?.tokens?.[chainId];

      if (chain) {
        const jsonRpcProvider = new JsonRpcProvider(chain.rpcUrl, {
          chainId,
          name: chain.name
        });

        if (jsonRpcProvider) {
          if (token) {
            // Get balance from custom token address
            const erc20 = new Contract(token.address, erc20ABI, jsonRpcProvider);
            // @ts-expect-error
            const decimals = await erc20.decimals();
            // @ts-expect-error
            const symbol = await erc20.symbol();
            // @ts-expect-error
            const balanceOf = await erc20.balanceOf(address);
            this.setBalance(formatUnits(balanceOf, decimals), symbol);
          } else {
            const balance = await jsonRpcProvider.getBalance(address);
            const formattedBalance = formatEther(balance);
            this.setBalance(formattedBalance, chain.currency);
          }
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

      const authType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID];

      if (providerType === walletConnectType && chain) {
        const WalletConnectProvider = provider as unknown as EthereumProvider;

        if (WalletConnectProvider) {
          try {
            await WalletConnectProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
            });

            EthersStoreUtil.setChainId(chainId);
          } catch (switchError: any) {
            const message = switchError?.message as string;
            if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
              throw new Error('Chain is not supported');
            }
            await EthersHelpersUtil.addEthereumChain(
              WalletConnectProvider as unknown as Provider,
              chain
            );
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
            } else {
              throw new Error('Error switching network');
            }
          }
        }
      } else if (providerType === authType) {
        if (this.authProvider && chain?.chainId) {
          try {
            await this.authProvider?.switchNetwork(chain?.chainId);
            EthersStoreUtil.setChainId(chain.chainId);
          } catch {
            throw new Error('Switching chain failed');
          }
        }
      }
    }
  }

  private async handleAuthSetPreferredAccount(address: string, type: AppKitFrameAccountType) {
    if (!address) {
      return;
    }

    const chainId = this.getCaipNetwork()?.id;
    const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
    this.setCaipAddress(caipAddress);
    this.setPreferredAccountType(type);

    await this.syncAccount({ address: address as Address });
    this.setLoading(false);
  }

  private syncConnectors(config: ProviderType) {
    const _connectors: Connector[] = [];
    const EXCLUDED_CONNECTORS = [ConstantsUtil.AUTH_CONNECTOR_ID];

    _connectors.push({
      id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
      explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
      type: PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]!
    });

    config.extraConnectors?.forEach(connector => {
      if (!EXCLUDED_CONNECTORS.includes(connector.id)) {
        if (connector.id === ConstantsUtil.COINBASE_CONNECTOR_ID) {
          _connectors.push({
            id: ConstantsUtil.COINBASE_CONNECTOR_ID,
            explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
            imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_CONNECTOR_ID],
            imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_CONNECTOR_ID],
            name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID],
            type: PresetsUtil.ConnectorTypesMap[ConstantsUtil.COINBASE_CONNECTOR_ID]!
          });
          this.checkActiveCoinbaseProvider(connector as Provider);
        } else {
          _connectors.push({
            id: connector.id,
            name: connector.name,
            type: 'EXTERNAL'
          });
        }
      }
    });

    this.setConnectors(_connectors);
  }

  private async syncAuthConnector(config: ProviderType) {
    const authConnector = config.extraConnectors?.find(
      connector => connector.id === ConstantsUtil.AUTH_CONNECTOR_ID
    );

    if (!authConnector) {
      return;
    }

    this.authProvider = authConnector as AppKitFrameProvider;

    this.addConnector({
      id: ConstantsUtil.AUTH_CONNECTOR_ID,
      name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.AUTH_CONNECTOR_ID],
      type: PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID]!,
      provider: authConnector
    });

    const connectedConnector = await StorageUtil.getItem('@w3m/connected_connector');
    if (connectedConnector === 'AUTH') {
      this.setLoading(true);
    }

    const { isConnected } = await this.authProvider.isConnected();
    if (isConnected) {
      this.setAuthProvider();
    }

    this.addAuthListeners(this.authProvider);
  }

  private async addAuthListeners(authProvider: AppKitFrameProvider) {
    authProvider.onSetPreferredAccount(async ({ address, type }) => {
      if (address) {
        await this.handleAuthSetPreferredAccount(address, type);
      }
      this.setLoading(false);
    });
  }
}
