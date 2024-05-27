import { formatUnits, type Hex } from 'viem';
import {
  type GetAccountReturnType,
  connect,
  disconnect,
  switchChain,
  watchAccount,
  watchConnectors,
  getEnsName,
  getEnsAvatar as wagmiGetEnsAvatar,
  getBalance
} from '@wagmi/core';
import { mainnet, type Chain } from '@wagmi/core/chains';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  type ConnectionControllerClient,
  type Connector,
  type LibraryOptions,
  type NetworkControllerClient,
  type PublicStateControllerState,
  type Token,
  Web3ModalScaffold
} from '@web3modal/scaffold-react-native';
import {
  ConstantsUtil,
  HelpersUtil,
  PresetsUtil,
  StorageUtil
} from '@web3modal/scaffold-utils-react-native';
import {
  getCaipDefaultChain,
  getEmailCaipNetworks,
  getWalletConnectCaipNetworks
} from './utils/helpers';
import { defaultWagmiConfig } from './utils/defaultWagmiConfig';

// -- Types ---------------------------------------------------------------------
type WagmiConfig = ReturnType<typeof defaultWagmiConfig>;

export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  wagmiConfig: WagmiConfig;
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

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {
  private hasSyncedConnectedAccount = false;

  private options: Web3ModalClientOptions | undefined = undefined;

  private wagmiConfig: WagmiConfig;

  public constructor(options: Web3ModalClientOptions) {
    const { wagmiConfig, defaultChain, tokens, _sdkVersion, ...w3mOptions } = options;

    if (!wagmiConfig) {
      throw new Error('web3modal:constructor - wagmiConfig is undefined');
    }

    if (!w3mOptions.projectId) {
      throw new Error('web3modal:constructor - projectId is undefined');
    }

    const networkControllerClient: NetworkControllerClient = {
      switchCaipNetwork: async caipNetwork => {
        const chainId = HelpersUtil.caipNetworkIdToNumber(caipNetwork?.id);
        if (chainId) {
          await switchChain(wagmiConfig, { chainId });
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = await StorageUtil.getConnectedConnector();
        const walletConnectType =
          PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];

        const emailType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EMAIL_CONNECTOR_ID];

        if (walletChoice?.includes(walletConnectType)) {
          const connector = wagmiConfig.connectors.find(
            c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
          );

          return getWalletConnectCaipNetworks(connector);
        } else if (emailType) {
          return getEmailCaipNetworks();
        }

        return { approvedCaipNetworkIds: undefined, supportsAllNetworks: true };
      }
    };

    const connectionControllerClient: ConnectionControllerClient = {
      connectWalletConnect: async onUri => {
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

        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        await connect(this.wagmiConfig, { connector, chainId });
      },

      connectExternal: async ({ id }) => {
        const connector = wagmiConfig.connectors.find(c => c.id === id);
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined');
        }

        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        await connect(this.wagmiConfig, { connector, chainId });
      },

      disconnect: async () => {
        await disconnect(this.wagmiConfig);
      }
    };

    super({
      networkControllerClient,
      connectionControllerClient,
      defaultChain: getCaipDefaultChain(defaultChain),
      tokens: HelpersUtil.getCaipTokens(tokens),
      _sdkVersion: _sdkVersion ?? `react-native-wagmi-${ConstantsUtil.VERSION}`,
      ...w3mOptions
    });

    this.options = options;
    this.wagmiConfig = wagmiConfig;

    this.syncRequestedNetworks([...wagmiConfig.chains]);
    this.syncConnectors(wagmiConfig.connectors);
    this.listenEmailConnector(wagmiConfig.connectors);

    watchConnectors(wagmiConfig, {
      onChange: connectors => this.syncConnectors([...connectors])
    });

    watchAccount(wagmiConfig, {
      onChange: accountData => {
        this.syncAccount({ ...accountData });
      }
    });
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
    connector
  }: Pick<GetAccountReturnType, 'address' | 'isConnected' | 'chainId' | 'connector'>) {
    this.resetAccount();
    this.syncNetwork(address, chainId, isConnected);

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
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
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
    if (chain) {
      const balance = await getBalance(this.wagmiConfig, {
        address,
        chainId: chain.id
      });
      const formattedBalance = formatUnits(balance.value, balance.decimals);
      this.setBalance(formattedBalance, balance.symbol);

      return;
    }
    this.setBalance(undefined, undefined);
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
      this.setConnectedWalletInfo({ name: connector.name, icon: connector.icon });
    }
  }

  private syncConnectors(connectors: Web3ModalClientOptions['wagmiConfig']['connectors']) {
    const uniqueIds = new Set();
    const filteredConnectors = connectors.filter(
      item => !uniqueIds.has(item.id) && uniqueIds.add(item.id)
    );

    const excludedConnectors = [ConstantsUtil.EMAIL_CONNECTOR_ID];

    const w3mConnectors: Connector[] = [];
    filteredConnectors.forEach(({ id, name, icon }) => {
      if (!excludedConnectors.includes(id)) {
        w3mConnectors.push({
          id,
          explorerId: PresetsUtil.ConnectorExplorerIds[id],
          imageId: PresetsUtil.ConnectorImageIds[id] ?? icon,
          imageUrl: this.options?.connectorImages?.[id],
          name: PresetsUtil.ConnectorNamesMap[id] ?? name,
          type: PresetsUtil.ConnectorTypesMap[id] ?? 'EXTERNAL'
        });
      }
    });

    this.setConnectors(w3mConnectors);
    this.syncEmailConnector(filteredConnectors);
  }

  private async syncEmailConnector(
    connectors: Web3ModalClientOptions['wagmiConfig']['connectors']
  ) {
    const emailConnector = connectors.find(({ id }) => id === ConstantsUtil.EMAIL_CONNECTOR_ID);
    if (emailConnector) {
      const provider = await emailConnector.getProvider();
      this.addConnector({
        id: ConstantsUtil.EMAIL_CONNECTOR_ID,
        type: 'EMAIL',
        name: 'Email',
        provider
      });
    }
  }

  private async listenEmailConnector(
    connectors: Web3ModalClientOptions['wagmiConfig']['connectors']
  ) {
    const connector = connectors.find(c => c.id === ConstantsUtil.EMAIL_CONNECTOR_ID);

    const connectedConnector = await StorageUtil.getItem('@w3m/connected_connector');
    if (connector && connectedConnector === 'EMAIL') {
      super.setLoading(true);
    }
  }
}
