import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref, snapshot } from 'valtio';
import type { AuthConnector, Connector } from '../utils/TypeUtil';
// import { StorageUtil } from '../utils/StorageUtil';
import { OptionsController } from './OptionsController';
import { ThemeController } from './ThemeController';
import { ConstantsUtil } from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
export interface ConnectorWithProviders extends Connector {
  connectors?: Connector[];
}
export interface ConnectorControllerState {
  allConnectors: Connector[];
  connectors: ConnectorWithProviders[];
  // connectedConnector?: ConnectorType;
  authLoading?: boolean;
}

type StateKey = keyof ConnectorControllerState;

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  allConnectors: [],
  connectors: []
});

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    const newConnectors = connectors.filter(
      newConnector =>
        !state.allConnectors.some(
          existingConnector =>
            existingConnector.id === newConnector.id &&
            this.getConnectorName(existingConnector.name) ===
              this.getConnectorName(newConnector.name) &&
            existingConnector.chain === newConnector.chain
        )
    );

    /**
     * We are reassigning the state of the proxy to a new array of new objects, this can cause issues. So it is better to use ref in this case.
     * Check more about proxy on https://valtio.dev/docs/api/basic/proxy#Gotchas
     * Check more about ref on https://valtio.dev/docs/api/basic/ref
     */
    newConnectors.forEach(connector => {
      state.allConnectors.push(ref(connector));
    });
  },

  getConnectors() {
    return state.connectors;
  },

  getConnector(id: string, rdns?: string | null) {
    return state.connectors.find(c => c.explorerId === id || c.info?.rdns === rdns);
  },

  getAuthConnector() {
    return state.allConnectors.find(c => c.type === 'AUTH');
  },

  // setConnectedConnector(
  //   connectorType: ConnectorControllerState['connectedConnector'],
  //   saveStorage = true
  // ) {
  //   state.connectedConnector = connectorType;

  //   if (saveStorage) {
  //     if (connectorType) {
  //       StorageUtil.setConnectedConnector(connectorType);
  //     } else {
  //       StorageUtil.removeConnectedConnector();
  //     }
  //   }
  // },

  setAuthLoading(loading: ConnectorControllerState['authLoading']) {
    state.authLoading = loading;
  },

  mergeMultiChainConnectors(connectors: Connector[]) {
    const connectorsByNameMap = this.generateConnectorMapByName(connectors);

    const mergedConnectors: ConnectorWithProviders[] = [];

    connectorsByNameMap.forEach(keyConnectors => {
      const firstItem = keyConnectors[0];

      const isAuthConnector = firstItem?.id === ConstantsUtil.CONNECTOR_ID.AUTH;

      if (keyConnectors.length > 1 && firstItem) {
        mergedConnectors.push({
          name: firstItem.name,
          imageUrl: firstItem.imageUrl,
          imageId: firstItem.imageId,
          connectors: [...keyConnectors],
          type: isAuthConnector ? 'AUTH' : 'MULTI_CHAIN',
          // These values are just placeholders, we don't use them in multi-chain connector select screen
          chain: 'eip155',
          id: firstItem?.id || ''
        });
      } else if (firstItem) {
        mergedConnectors.push(firstItem);
      }
    });

    return mergedConnectors;
  },

  generateConnectorMapByName(connectors: Connector[]): Map<string, Connector[]> {
    const connectorsByNameMap = new Map<string, Connector[]>();

    connectors.forEach(connector => {
      const { name } = connector;
      const connectorName = this.getConnectorName(name);

      if (!connectorName) {
        return;
      }

      const connectorsByName = connectorsByNameMap.get(connectorName) || [];
      const haveSameConnector = connectorsByName.find(c => c.chain === connector.chain);
      if (!haveSameConnector) {
        connectorsByName.push(connector);
      }
      connectorsByNameMap.set(connectorName, connectorsByName);
    });

    return connectorsByNameMap;
  },

  getConnectorName(name: string | undefined) {
    if (!name) {
      return name;
    }

    const nameOverrideMap = {
      'Trust Wallet': 'Trust'
    };

    return (nameOverrideMap as Record<string, string>)[name] || name;
  },

  getUniqueConnectorsByName(connectors: Connector[]) {
    const uniqueConnectors: Connector[] = [];

    connectors.forEach(c => {
      if (!uniqueConnectors.find(uc => uc.chain === c.chain)) {
        uniqueConnectors.push(c);
      }
    });

    return uniqueConnectors;
  },

  addConnector(connector: Connector | AuthConnector) {
    if (connector.id === ConstantsUtil.CONNECTOR_ID.AUTH) {
      const authConnector = connector as AuthConnector;

      const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state;
      const themeMode = ThemeController.getSnapshot().themeMode;
      const themeVariables = ThemeController.getSnapshot().themeVariables;

      authConnector?.provider?.syncDappData?.({
        metadata: optionsState.metadata,
        sdkVersion: optionsState.sdkVersion,
        projectId: optionsState.projectId,
        sdkType: optionsState.sdkType
      });
      authConnector?.provider?.syncTheme({
        themeMode,
        themeVariables
      });
      this.setConnectors([connector]);
    } else {
      this.setConnectors([connector]);
    }
  },

  syncIfAuthConnector(connector: Connector | AuthConnector) {
    //TODO: Whats this ID
    if (connector.id !== 'ID_AUTH') {
      return;
    }

    const authConnector = connector as AuthConnector;

    const optionsState = snapshot(OptionsController.state) as typeof OptionsController.state;
    const themeMode = ThemeController.getSnapshot().themeMode;
    const themeVariables = ThemeController.getSnapshot().themeVariables;

    authConnector?.provider?.syncDappData?.({
      metadata: optionsState.metadata,
      sdkVersion: optionsState.sdkVersion,
      sdkType: optionsState.sdkType,
      projectId: optionsState.projectId
    });
    authConnector.provider.syncTheme({
      themeMode,
      themeVariables
    });
  }
};
