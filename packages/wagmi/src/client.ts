import { formatUnits, type Hex, parseUnits } from 'viem';
import {
  type GetAccountReturnType,
  type GetEnsAddressReturnType,
  type Connector as WagmiConnector,
  connect,
  reconnect,
  disconnect,
  signMessage,
  getAccount,
  switchChain,
  watchAccount,
  watchConnectors,
  getEnsName,
  getEnsAvatar as wagmiGetEnsAvatar,
  getEnsAddress as wagmiGetEnsAddress,
  getBalance,
  prepareTransactionRequest,
  estimateGas as wagmiEstimateGas,
  sendTransaction as wagmiSendTransaction,
  waitForTransactionReceipt,
  writeContract as wagmiWriteContract
} from '@wagmi/core';
import { normalize } from 'viem/ens';
import { mainnet, type Chain } from '@wagmi/core/chains';
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider';
import { type JsonRpcError } from '@walletconnect/jsonrpc-types';
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
  type AppKitFrameProvider,
  type EstimateGasTransactionArgs
} from '@reown/appkit-scaffold-react-native';
import { HelpersUtil, StorageUtil } from '@reown/appkit-scaffold-utils-react-native';
import {
  NetworkUtil,
  NamesUtil,
  ErrorUtil,
  ConstantsUtil,
  PresetsUtil,
  type ConnectorType
} from '@reown/appkit-common-react-native';
import {
  SIWEController,
  getDidChainId,
  getDidAddress,
  type AppKitSIWEClient
} from '@reown/appkit-siwe-react-native';
import {
  getCaipDefaultChain,
  getAuthCaipNetworks,
  getWalletConnectCaipNetworks,
  requireCaipAddress
} from './utils/helpers';
import { defaultWagmiConfig } from './utils/defaultWagmiConfig';

// -- Types ---------------------------------------------------------------------
type WagmiConfig = ReturnType<typeof defaultWagmiConfig>;

export interface AppKitClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  wagmiConfig: WagmiConfig;
  siweConfig?: AppKitSIWEClient;
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

// -- Client --------------------------------------------------------------------
export class AppKit extends AppKitScaffold {
  private hasSyncedConnectedAccount = false;

  private options: AppKitClientOptions | undefined = undefined;

  private wagmiConfig: WagmiConfig;

  public constructor(options: AppKitClientOptions) {
    const { wagmiConfig, siweConfig, defaultChain, tokens, _sdkVersion, ...appKitOptions } =
      options;

    if (!wagmiConfig) {
      throw new Error('appkit:constructor - wagmiConfig is undefined');
    }

    if (!appKitOptions.projectId) {
      throw new Error(ErrorUtil.ALERT_ERRORS.PROJECT_ID_NOT_CONFIGURED.shortMessage);
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id);
        if (chainId) {
          await switchChain(wagmiConfig, { chainId });
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = await StorageUtil.getConnectedConnector();
        const walletConnectType =
          PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]!;

        const authType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID]!;

        if (walletChoice?.includes(walletConnectType)) {
          const connector = wagmiConfig.connectors.find(
            c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
          );

          return getWalletConnectCaipNetworks(connector);
        } else if (authType) {
          return getAuthCaipNetworks();
        }

        return { approvedCaipNetworkIds: undefined, supportsAllNetworks: true };
      }
    };

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async (onUri, walletUniversalLink) => {
        const connector = wagmiConfig.connectors.find(
          c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
        );
        if (!connector) {
          throw new Error(
            'connectionControllerClient:getWalletConnectUri - connector is undefined'
          );
        }

        const provider = (await connector.getProvider()) as Awaited<
          ReturnType<(typeof EthereumProvider)['init']>
        >;

        provider.on('display_uri', data => {
          onUri(data);
        });

        // When connecting through walletconnect, we need to set the clientId in the store
        const clientId = await provider.signer?.client?.core?.crypto?.getClientId();
        if (clientId) {
          this.setClientId(clientId);
        }

        const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);

        // SIWE
        const siweParams = await siweConfig?.getMessageParams?.();
        // Make sure client uses ethereum provider version that supports `authenticate`
        if (
          siweConfig?.options?.enabled &&
          typeof provider?.authenticate === 'function' &&
          siweParams &&
          Object.keys(siweParams || {}).length > 0
        ) {
          // @ts-expect-error - setting requested chains beforehand avoids wagmi auto disconnecting the session when `connect` is called because it things chains are stale
          await connector.setRequestedChainsIds(siweParams.chains);
          const result = await provider.authenticate(
            {
              nonce: await siweConfig.getNonce(),
              methods: [...OPTIONAL_METHODS],
              ...siweParams
            },
            walletUniversalLink
          );

          // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
          const signedCacao = result?.auths?.[0];
          if (signedCacao) {
            const { p, s } = signedCacao;
            const cacaoChainId = getDidChainId(p.iss) || '';
            const address = getDidAddress(p.iss);
            try {
              // Kicks off verifyMessage and populates external states
              const message = provider.signer.client.formatAuthMessage({
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
                  chainId: parseInt(cacaoChainId, 10)
                };

                SIWEController.setSession(session);
                SIWEController.onSignIn?.(session);
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Error verifying message', error);
              // eslint-disable-next-line no-console
              await provider.disconnect().catch(console.error);
              // eslint-disable-next-line no-console
              await SIWEController.signOut().catch(console.error);
              throw error;
            }
            /*
             * Unassign the connector from the wagmiConfig and allow connect() to reassign it in the next step
             * this avoids case where wagmi throws because the connector is already connected
             * what we need connect() to do is to only setup internal event listeners
             */
            this.wagmiConfig.state.current = '';
          }
        }

        await connect(this.wagmiConfig, { connector, chainId });
      },

      connectExternal: async ({ id }) => {
        const connector = wagmiConfig.connectors.find(c => c.id === id);
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined');
        }

        // If connecting with something else than walletconnect, we need to clear the clientId in the store
        this.setClientId(null);

        const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        await connect(this.wagmiConfig, { connector, chainId });
      },

      signMessage: async message => signMessage(this.wagmiConfig, { message }),

      disconnect: async () => {
        await disconnect(this.wagmiConfig);
        this.setClientId(null);

        if (siweConfig?.options?.signOutOnDisconnect) {
          await SIWEController.signOut();
        }
      },

      sendTransaction: async (data: SendTransactionArgs) => {
        const { chainId } = getAccount(this.wagmiConfig);

        const txParams = {
          account: data.address,
          to: data.to,
          value: data.value,
          gas: data.gas,
          gasPrice: data.gasPrice,
          data: data.data,
          chainId,
          type: 'legacy' as const
        };

        await prepareTransactionRequest(this.wagmiConfig, txParams);
        const tx = await wagmiSendTransaction(this.wagmiConfig, txParams);

        await waitForTransactionReceipt(this.wagmiConfig, { hash: tx, timeout: 25000 });

        return tx;
      },

      writeContract: async (data: WriteContractArgs) => {
        const caipAddress = this.getCaipAddress() || '';
        const account = requireCaipAddress(caipAddress);
        const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);

        const tx = await wagmiWriteContract(wagmiConfig, {
          chainId,
          address: data.tokenAddress,
          account,
          abi: data.abi,
          functionName: data.method,
          args: [data.receiverAddress, data.tokenAmount]
        });

        return tx;
      },

      estimateGas: async ({
        address,
        to,
        data,
        chainNamespace
      }: EstimateGasTransactionArgs): Promise<bigint> => {
        if (chainNamespace && chainNamespace !== 'eip155') {
          throw new Error('estimateGas - chainNamespace is not eip155');
        }

        try {
          const result = await wagmiEstimateGas(this.wagmiConfig, {
            account: address as Hex,
            to: to as Hex,
            data: data as Hex,
            type: 'legacy'
          });

          return result;
        } catch (error) {
          throw new Error('WagmiAdapter:estimateGas - error estimating gas');
        }
      },

      parseUnits,

      formatUnits,

      getEnsAddress: async (value: string) => {
        try {
          if (!this.wagmiConfig) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworksData - wagmiConfig is undefined'
            );
          }
          const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id));
          let ensName: boolean | GetEnsAddressReturnType = false;
          let wcName: boolean | string = false;
          if (NamesUtil.isReownName(value)) {
            wcName = (await this.resolveReownName(value)) || false;
          }
          if (chainId === 1) {
            ensName = await wagmiGetEnsAddress(this.wagmiConfig, {
              name: normalize(value),
              chainId
            });
          }

          return ensName || wcName || false;
        } catch {
          return false;
        }
      },
      getEnsAvatar: async (value: string) => {
        const chainId = Number(NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id));
        if (chainId !== mainnet.id) {
          return false;
        }
        const avatar = await wagmiGetEnsAvatar(this.wagmiConfig, {
          name: normalize(value),
          chainId
        });

        return avatar || false;
      }
    };

    super({
      networkControllerClient,
      connectionControllerClient,
      siweControllerClient: siweConfig,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `react-native-wagmi-${ConstantsUtil.VERSION}`,
      ...appKitOptions
    });

    this.options = options;
    this.wagmiConfig = wagmiConfig;

    this.syncRequestedNetworks([...wagmiConfig.chains]);
    this.syncConnectors([...wagmiConfig.connectors]);

    watchConnectors(wagmiConfig, {
      onChange: connectors => this.syncConnectors([...connectors])
    });

    watchAccount(wagmiConfig, {
      onChange: (accountData, prevAccountData) => {
        this.syncAccount({ ...accountData });

        if (accountData.status === 'disconnected' && prevAccountData.status === 'connected') {
          this.close();
        }
      }
    });
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

  // -- Private -----------------------------------------------------------------
  private syncRequestedNetworks(chains: Chain[]) {
    const requestedCaipNetworks = chains?.map(
      chain =>
        ({
          id: `${ConstantsUtil.EIP155}:${chain.id}`,
          name: chain.name,
          imageId: PresetsUtil.EIP155NetworkImageIds[chain.id],
          imageUrl: this.options?.chainImages?.[chain.id]
        }) as CaipNetwork
    );
    this.setRequestedCaipNetworks(requestedCaipNetworks ?? []);
  }

  private async syncAccount({
    address,
    isConnected,
    chainId,
    connector,
    isConnecting,
    isReconnecting
  }: Pick<
    GetAccountReturnType,
    'address' | 'isConnected' | 'chainId' | 'connector' | 'isConnecting' | 'isReconnecting'
  >) {
    this.syncNetwork(address, chainId, isConnected);
    this.setLoading(!!connector && (isConnecting || isReconnecting));

    if (isConnected && address && chainId) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
      this.setIsConnected(isConnected);
      this.setCaipAddress(caipAddress);
      await Promise.all([
        this.syncProfile(address, chainId),
        this.syncBalance(address, chainId),
        this.syncConnectedWalletInfo(connector),
        this.getApprovedCaipNetworksData()
      ]);
      this.hasSyncedConnectedAccount = true;
    } else if (!isConnected && !isConnecting && !isReconnecting && this.hasSyncedConnectedAccount) {
      this.resetAccount();
      this.resetWcConnection();
      this.resetNetwork();
    }
  }

  private async syncNetwork(address?: Hex, chainId?: number, isConnected?: boolean) {
    const chain = this.wagmiConfig.chains.find((c: Chain) => c.id === chainId);

    if (chain || chainId) {
      const name = chain?.name ?? chainId?.toString();
      const id = Number(chain?.id ?? chainId);
      const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${id}`;
      this.setCaipNetwork({
        id: caipChainId,
        name,
        imageId: PresetsUtil.EIP155NetworkImageIds[id],
        imageUrl: this.options?.chainImages?.[id]
      });
      if (isConnected && address && chainId) {
        const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${id}:${address}`;
        this.setCaipAddress(caipAddress);
        if (chain?.blockExplorers?.default?.url) {
          const url = `${chain.blockExplorers.default.url}/address/${address}`;
          this.setAddressExplorerUrl(url);
        } else {
          this.setAddressExplorerUrl(undefined);
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncProfile(address, chainId);
          await this.syncBalance(address, chainId);
        }
      }
    }
  }

  private async syncProfile(address: Hex, chainId: number) {
    try {
      const response = await this.fetchIdentity({ address });

      if (!response) {
        throw new Error('Couldnt fetch idendity');
      }

      this.setProfileName(response.name);
      this.setProfileImage(response.avatar);
    } catch {
      if (chainId === mainnet.id) {
        const profileName = await getEnsName(this.wagmiConfig, { address, chainId });
        if (profileName) {
          this.setProfileName(profileName);
          const profileImage = await wagmiGetEnsAvatar(this.wagmiConfig, {
            name: profileName,
            chainId
          });
          if (profileImage) {
            this.setProfileImage(profileImage);
          }
        }
      } else {
        this.setProfileName(undefined);
        this.setProfileImage(undefined);
      }
    }
  }

  private async syncBalance(address: Hex, chainId: number) {
    const chain = this.wagmiConfig.chains.find((c: Chain) => c.id === chainId);
    try {
      if (chain) {
        const balance = await getBalance(this.wagmiConfig, {
          address,
          chainId: chain.id,
          token: this.options?.tokens?.[chainId]?.address as Hex
        });
        const formattedBalance = formatUnits(balance.value, balance.decimals);
        this.setBalance(formattedBalance, balance.symbol);

        return;
      }
      this.setBalance(undefined, undefined);
    } catch {
      this.setBalance(undefined, undefined);
    }
  }

  private async syncConnectedWalletInfo(connector: GetAccountReturnType['connector']) {
    if (!connector) {
      throw Error('syncConnectedWalletInfo - connector is undefined');
    }

    if (connector.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && connector.getProvider) {
      const walletConnectProvider = (await connector.getProvider()) as Awaited<
        ReturnType<(typeof EthereumProvider)['init']>
      >;
      if (walletConnectProvider.session) {
        this.setConnectedWalletInfo({
          ...walletConnectProvider.session.peer.metadata,
          name: walletConnectProvider.session.peer.metadata.name,
          icon: walletConnectProvider.session.peer.metadata.icons?.[0]
        });
      }
    } else {
      this.setConnectedWalletInfo({
        id: connector.id,
        name: connector.name,
        icon: this.options?.connectorImages?.[connector.id] ?? connector.icon
      });
    }
  }

  private syncConnectors(connectors: AppKitClientOptions['wagmiConfig']['connectors']) {
    const uniqueIds = new Set();
    const filteredConnectors = connectors.filter(
      item => !uniqueIds.has(item.id) && uniqueIds.add(item.id)
    );

    const excludedConnectors = [ConstantsUtil.AUTH_CONNECTOR_ID];

    const _connectors: Connector[] = [];
    filteredConnectors.forEach(({ id, name, icon }) => {
      if (!excludedConnectors.includes(id)) {
        _connectors.push({
          id,
          explorerId: PresetsUtil.ConnectorExplorerIds[id],
          imageId: PresetsUtil.ConnectorImageIds[id] ?? icon,
          imageUrl: this.options?.connectorImages?.[id],
          name: PresetsUtil.ConnectorNamesMap[id] ?? name,
          type: PresetsUtil.ConnectorTypesMap[id] ?? 'EXTERNAL'
        });
      }
    });

    this.setConnectors(_connectors);
    this.syncWalletConnectListeners(filteredConnectors);
    this.syncAuthConnector(filteredConnectors);
  }

  private async syncWalletConnectListeners(
    connectors: AppKitClientOptions['wagmiConfig']['connectors']
  ) {
    const connector = connectors.find(({ id }) => id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID);
    if (connector) {
      const provider = (await connector.getProvider()) as EthereumProvider;

      provider.signer.client.core.relayer.on('relayer_connect', () => {
        provider.signer.client.core.relayer?.provider?.on('payload', (payload: JsonRpcError) => {
          if (payload?.error) {
            this.handleAlertError(payload?.error.message);
          }
        });
      });
    }
  }

  private async syncAuthConnector(connectors: AppKitClientOptions['wagmiConfig']['connectors']) {
    const authConnector = connectors.find(({ id }) => id === ConstantsUtil.AUTH_CONNECTOR_ID);
    if (authConnector) {
      const provider = await authConnector.getProvider();
      this.addConnector({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: PresetsUtil.ConnectorTypesMap[ConstantsUtil.AUTH_CONNECTOR_ID]!,
        name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.AUTH_CONNECTOR_ID],
        provider
      });
      this.addAuthListeners(authConnector);
    }
  }

  private async addAuthListeners(connector: WagmiConnector) {
    const connectedConnector: ConnectorType | undefined = await StorageUtil.getItem(
      '@w3m/connected_connector'
    );

    if (connectedConnector === 'AUTH') {
      // Set loader until it reconnects
      super.setLoading(true);
    }

    const provider = (await connector.getProvider()) as AppKitFrameProvider;

    provider.onSetPreferredAccount(async () => {
      await reconnect(this.wagmiConfig, { connectors: [connector] });
    });

    provider.setOnTimeout(async () => {
      this.handleAlertError(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT);
      this.setLoading(false);
    });
  }
}
