import { RouterUtil } from './RouterUtil';
import { RouterController } from '../controllers/RouterController';
import { NetworkController } from '../controllers/NetworkController';
import { AccountController } from '../controllers/AccountController';
import { ConnectorController } from '../controllers/ConnectorController';
import { SwapController } from '../controllers/SwapController';
import type { CaipNetwork } from '../utils/TypeUtil';

export const NetworkUtil = {
  async handleNetworkSwitch(network: CaipNetwork) {
    const { isConnected } = AccountController.state;
    const { caipNetwork, approvedCaipNetworkIds, supportsAllNetworks } = NetworkController.state;
    const isAuthConnector = ConnectorController.state.connectedConnector === 'AUTH';
    let eventData = null;

    if (isConnected && caipNetwork?.id !== network.id) {
      if (approvedCaipNetworkIds?.includes(network.id) && !isAuthConnector) {
        await NetworkController.switchActiveNetwork(network);
        RouterUtil.goBackOrCloseModal();
        eventData = { type: 'SWITCH_NETWORK', networkId: network.id };
      } else if (supportsAllNetworks || isAuthConnector) {
        RouterController.push('SwitchNetwork', { network });
      }
    } else if (!isConnected) {
      NetworkController.setCaipNetwork(network);
      RouterController.push('Connect');
    }

    SwapController.resetState();

    return eventData;
  }
};
