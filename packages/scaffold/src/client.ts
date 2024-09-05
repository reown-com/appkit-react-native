import './config/animations';

import type {
  AccountControllerState,
  ConnectionControllerClient,
  ModalControllerState,
  NetworkControllerClient,
  NetworkControllerState,
  OptionsControllerState,
  EventsControllerState,
  PublicStateControllerState,
  ThemeControllerState,
  ThemeMode,
  ThemeVariables,
  Connector,
  ConnectedWalletInfo
} from '@web3modal/core-react-native';
import type { SIWEControllerClient } from '@web3modal/siwe-react-native';
import {
  AccountController,
  BlockchainApiController,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  NetworkController,
  OptionsController,
  PublicStateController,
  StorageUtil,
  ThemeController
} from '@web3modal/core-react-native';
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils-react-native';

// -- Types ---------------------------------------------------------------------
export interface LibraryOptions {
  projectId: OptionsControllerState['projectId'];
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
  includeWalletIds?: OptionsControllerState['includeWalletIds'];
  excludeWalletIds?: OptionsControllerState['excludeWalletIds'];
  featuredWalletIds?: OptionsControllerState['featuredWalletIds'];
  customWallets?: OptionsControllerState['customWallets'];
  defaultChain?: NetworkControllerState['caipNetwork'];
  tokens?: OptionsControllerState['tokens'];
  clipboardClient?: OptionsControllerState['_clipboardClient'];
  enableAnalytics?: OptionsControllerState['enableAnalytics'];
  _sdkVersion: OptionsControllerState['sdkVersion'];
  metadata?: OptionsControllerState['metadata'];
}

export interface ScaffoldOptions extends LibraryOptions {
  networkControllerClient: NetworkControllerClient;
  connectionControllerClient: ConnectionControllerClient;
  siweControllerClient?: SIWEControllerClient;
}

export interface OpenOptions {
  view: 'Account' | 'Connect' | 'Networks';
}

// -- Client --------------------------------------------------------------------
export class Web3ModalScaffold {
  public constructor(options: ScaffoldOptions) {
    this.initControllers(options);
  }

  // -- Public -------------------------------------------------------------------
  public async open(options?: OpenOptions) {
    ModalController.open(options);
  }

  public async close() {
    ModalController.close();
  }

  public getThemeMode() {
    return ThemeController.state.themeMode;
  }

  public getThemeVariables() {
    return ThemeController.state.themeVariables;
  }

  public setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    ThemeController.setThemeMode(themeMode);
  }

  public setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    ThemeController.setThemeVariables(themeVariables);
  }

  public subscribeTheme(callback: (newState: ThemeControllerState) => void) {
    return ThemeController.subscribe(callback);
  }

  public getWalletInfo() {
    return AccountController.state.connectedWalletInfo;
  }

  public subscribeWalletInfo(callback: (newState: ConnectedWalletInfo) => void) {
    return AccountController.subscribeKey('connectedWalletInfo', callback);
  }

  public getState() {
    return { ...PublicStateController.state };
  }

  public subscribeState(callback: (newState: PublicStateControllerState) => void) {
    return PublicStateController.subscribe(callback);
  }

  public subscribeStateKey<K extends keyof PublicStateControllerState>(
    key: K,
    callback: (value: PublicStateControllerState[K]) => void
  ) {
    return PublicStateController.subscribeKey(key, callback);
  }

  public subscribeConnection(
    callback: (isConnected: AccountControllerState['isConnected']) => void
  ) {
    return AccountController.subscribeKey('isConnected', callback);
  }

  public setLoading(loading: ModalControllerState['loading']) {
    ModalController.setLoading(loading);
  }

  public getEvent() {
    return { ...EventsController.state };
  }

  public subscribeEvents(callback: (newEvent: EventsControllerState) => void) {
    return EventsController.subscribe(callback);
  }

  // -- Protected ----------------------------------------------------------------
  protected setIsConnected: (typeof AccountController)['setIsConnected'] = isConnected => {
    AccountController.setIsConnected(isConnected);
  };

  protected setCaipAddress: (typeof AccountController)['setCaipAddress'] = caipAddress => {
    AccountController.setCaipAddress(caipAddress);
  };

  protected getCaipAddress = () => AccountController.state.caipAddress;

  protected setBalance: (typeof AccountController)['setBalance'] = (balance, balanceSymbol) => {
    AccountController.setBalance(balance, balanceSymbol);
  };

  protected setProfileName: (typeof AccountController)['setProfileName'] = profileName => {
    AccountController.setProfileName(profileName);
  };

  protected setProfileImage: (typeof AccountController)['setProfileImage'] = profileImage => {
    AccountController.setProfileImage(profileImage);
  };

  protected resetAccount: (typeof AccountController)['resetAccount'] = () => {
    AccountController.resetAccount();
  };

  protected setCaipNetwork: (typeof NetworkController)['setCaipNetwork'] = caipNetwork => {
    NetworkController.setCaipNetwork(caipNetwork);
  };

  protected getCaipNetwork = () => NetworkController.state.caipNetwork;

  protected setRequestedCaipNetworks: (typeof NetworkController)['setRequestedCaipNetworks'] =
    requestedCaipNetworks => {
      NetworkController.setRequestedCaipNetworks(requestedCaipNetworks);
    };

  protected getApprovedCaipNetworksData: (typeof NetworkController)['getApprovedCaipNetworksData'] =
    () => NetworkController.getApprovedCaipNetworksData();

  protected resetNetwork: (typeof NetworkController)['resetNetwork'] = () => {
    NetworkController.resetNetwork();
  };

  protected setConnectors: (typeof ConnectorController)['setConnectors'] = (
    connectors: Connector[]
  ) => {
    ConnectorController.setConnectors(connectors);
    this.setConnectorExcludedWallets(connectors);
  };

  protected addConnector: (typeof ConnectorController)['addConnector'] = (connector: Connector) => {
    ConnectorController.addConnector(connector);
  };

  protected getConnectors: (typeof ConnectorController)['getConnectors'] = () =>
    ConnectorController.getConnectors();

  protected resetWcConnection: (typeof ConnectionController)['resetWcConnection'] = () => {
    ConnectionController.resetWcConnection();
  };

  protected fetchIdentity: (typeof BlockchainApiController)['fetchIdentity'] = request =>
    BlockchainApiController.fetchIdentity(request);

  protected setAddressExplorerUrl: (typeof AccountController)['setAddressExplorerUrl'] =
    addressExplorerUrl => {
      AccountController.setAddressExplorerUrl(addressExplorerUrl);
    };

  protected setConnectedWalletInfo: (typeof AccountController)['setConnectedWalletInfo'] =
    connectedWalletInfo => {
      AccountController.setConnectedWalletInfo(connectedWalletInfo);
    };

  protected setClientId: (typeof BlockchainApiController)['setClientId'] = clientId => {
    BlockchainApiController.setClientId(clientId);
  };

  // -- Private ------------------------------------------------------------------
  private async initControllers(options: ScaffoldOptions) {
    this.initAsyncValues(options);
    NetworkController.setClient(options.networkControllerClient);
    NetworkController.setDefaultCaipNetwork(options.defaultChain);

    OptionsController.setProjectId(options.projectId);
    OptionsController.setIncludeWalletIds(options.includeWalletIds);
    OptionsController.setExcludeWalletIds(options.excludeWalletIds);
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds);
    OptionsController.setTokens(options.tokens);
    OptionsController.setCustomWallets(options.customWallets);
    OptionsController.setEnableAnalytics(options.enableAnalytics);
    OptionsController.setSdkVersion(options._sdkVersion);

    if (options.clipboardClient) {
      OptionsController.setClipboardClient(options.clipboardClient);
    }

    ConnectionController.setClient(options.connectionControllerClient);

    if (options.themeMode) {
      ThemeController.setThemeMode(options.themeMode);
    }
    if (options.themeVariables) {
      ThemeController.setThemeVariables(options.themeVariables);
    }
    if (options.metadata) {
      OptionsController.setMetadata(options.metadata);
    }

    if (options.siweControllerClient) {
      const { SIWEController } = await import('@web3modal/siwe-react-native');

      SIWEController.setSIWEClient(options.siweControllerClient);
    }
  }

  private async setConnectorExcludedWallets(connectors: Connector[]) {
    const excludedWallets = OptionsController.state.excludeWalletIds || [];

    // Exclude Coinbase if the connector is not implemented
    const excludeCoinbase =
      connectors.findIndex(connector => connector.id === ConstantsUtil.COINBASE_CONNECTOR_ID) ===
      -1;

    if (excludeCoinbase) {
      excludedWallets.push(PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_CONNECTOR_ID]!);
    }

    OptionsController.setExcludeWalletIds(excludedWallets);
  }

  private async initRecentWallets(options: ScaffoldOptions) {
    const wallets = await StorageUtil.getRecentWallets();
    const connectedWalletImage = await StorageUtil.getConnectedWalletImageUrl();

    const filteredWallets = wallets.filter(wallet => {
      const { includeWalletIds, excludeWalletIds } = options;
      if (includeWalletIds) {
        return includeWalletIds.includes(wallet.id);
      }
      if (excludeWalletIds) {
        return !excludeWalletIds.includes(wallet.id);
      }

      return true;
    });

    ConnectionController.setRecentWallets(filteredWallets);

    if (connectedWalletImage) {
      ConnectionController.setConnectedWalletImageUrl(connectedWalletImage);
    }
  }

  private async initConnectedConnector() {
    const connectedConnector = await StorageUtil.getConnectedConnector();
    if (connectedConnector) {
      ConnectorController.setConnectedConnector(connectedConnector);
    }
  }

  private async initAsyncValues(options: ScaffoldOptions) {
    await this.initConnectedConnector();
    await this.initRecentWallets(options);
  }
}
