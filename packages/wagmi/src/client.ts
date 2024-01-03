import type { Address, Chain, Config, Connector as WagmiConnector } from '@wagmi/core';
import {
  connect,
  disconnect,
  fetchBalance,
  fetchEnsAvatar,
  fetchEnsName,
  getAccount,
  getNetwork,
  switchNetwork,
  watchAccount,
  watchNetwork
} from '@wagmi/core';
import { mainnet } from '@wagmi/core/chains';
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
import { Web3ModalScaffold } from '@web3modal/scaffold-react-native';
import { StorageUtil } from '@web3modal/core-react-native';

import { ConstantsUtil, HelpersUtil, PresetsUtil } from '@web3modal/scaffold-utils-react-native';
import { getCaipDefaultChain } from './utils/helpers';

// -- Types ---------------------------------------------------------------------
interface CustomConnector<T, S> extends WagmiConnector<T, S> {
  // Add boolean to show installed checkmark
  installed?: boolean;
}

interface WagmiConfig extends Config<any, any> {
  connectors: CustomConnector<any, any>[];
}

export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
  wagmiConfig: WagmiConfig;
  chains?: Chain[];
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

  public constructor(options: Web3ModalClientOptions) {
    const { wagmiConfig, chains, defaultChain, tokens, _sdkVersion, ...w3mOptions } = options;

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
          await switchNetwork({ chainId });
        }
      },

      async getApprovedCaipNetworksData() {
        const walletChoice = await StorageUtil.getConnectedConnector();
        if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
          const connector = wagmiConfig.connectors.find(
            c => c.id === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID
          );
          if (!connector) {
            throw new Error(
              'networkControllerClient:getApprovedCaipNetworks - connector is undefined'
            );
          }
          const provider = await connector.getProvider();
          const ns = provider.signer?.session?.namespaces;
          const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
          const nsChains = ns?.[ConstantsUtil.EIP155]?.chains;

          return {
            supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD),
            approvedCaipNetworkIds: nsChains as CaipNetworkId[]
          };
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

        connector.on('message', event => {
          if (event.type === 'display_uri') {
            onUri(event.data as string);
            connector.removeAllListeners();
          }
        });

        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        await connect({ connector, chainId });
      },

      connectExternal: async ({ id }) => {
        const connector = wagmiConfig.connectors.find(c => c.id === id);
        if (!connector) {
          throw new Error('connectionControllerClient:connectExternal - connector is undefined');
        }

        const chainId = HelpersUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);

        await connect({ connector, chainId });
      },

      disconnect
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

    this.syncRequestedNetworks(chains);

    this.syncConnectors(wagmiConfig);

    watchAccount(() => this.syncAccount());
    watchNetwork(() => this.syncNetwork());
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
  private syncRequestedNetworks(chains: Web3ModalClientOptions['chains']) {
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

  private async syncAccount() {
    const { address, isConnected } = getAccount();
    const { chain } = getNetwork();
    this.resetAccount();
    if (isConnected && address && chain) {
      const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chain.id}:${address}`;
      this.setIsConnected(isConnected);
      this.setCaipAddress(caipAddress);
      await Promise.all([
        this.syncProfile(address),
        this.syncBalance(address, chain),
        this.getApprovedCaipNetworksData()
      ]);
      this.hasSyncedConnectedAccount = true;
    } else if (!isConnected && this.hasSyncedConnectedAccount) {
      this.resetWcConnection();
      this.resetNetwork();
    }
  }

  private async syncNetwork() {
    const { address, isConnected } = getAccount();
    const { chain } = getNetwork();

    if (chain) {
      const chainId = String(chain.id);
      const caipChainId: CaipNetworkId = `${ConstantsUtil.EIP155}:${chainId}`;
      this.setCaipNetwork({
        id: caipChainId,
        name: chain.name,
        imageId: PresetsUtil.EIP155NetworkImageIds[chain.id],
        imageUrl: this.options?.chainImages?.[chain.id]
      });
      if (isConnected && address) {
        const caipAddress: CaipAddress = `${ConstantsUtil.EIP155}:${chain.id}:${address}`;
        this.setCaipAddress(caipAddress);
        if (chain.blockExplorers?.default?.url) {
          const url = `${chain.blockExplorers.default.url}/address/${address}`;
          this.setAddressExplorerUrl(url);
        } else {
          this.setAddressExplorerUrl(undefined);
        }
        if (this.hasSyncedConnectedAccount) {
          await this.syncBalance(address, chain);
        }
      }
    }
  }

  private async syncProfile(address: Address) {
    try {
      const { name, avatar } = await this.fetchIdentity({
        caipChainId: `${ConstantsUtil.EIP155}:${mainnet.id}`,
        address
      });
      this.setProfileName(name);
      this.setProfileImage(avatar);
    } catch {
      const profileName = await fetchEnsName({ address, chainId: mainnet.id });
      if (profileName) {
        this.setProfileName(profileName);
        const profileImage = await fetchEnsAvatar({ name: profileName, chainId: mainnet.id });
        if (profileImage) {
          this.setProfileImage(profileImage);
        }
      }
    }
  }

  private async syncBalance(address: Address, chain: Chain) {
    const balance = await fetchBalance({
      address,
      chainId: chain.id,
      token: this.options?.tokens?.[chain.id]?.address as Address
    });
    this.setBalance(balance.formatted, balance.symbol);
  }

  private syncConnectors(wagmiConfig: Web3ModalClientOptions['wagmiConfig']) {
    const w3mConnectors: Connector[] = [];
    wagmiConfig.connectors.forEach(({ id, name, installed }) => {
      w3mConnectors.push({
        id,
        explorerId: PresetsUtil.ConnectorExplorerIds[id],
        imageId: PresetsUtil.ConnectorImageIds[id],
        imageUrl: this.options?.connectorImages?.[id],
        name: PresetsUtil.ConnectorNamesMap[id] ?? name,
        type: PresetsUtil.ConnectorTypesMap[id] ?? 'EXTERNAL',
        installed
      });
    });
    this.setConnectors(w3mConnectors);
  }
}
