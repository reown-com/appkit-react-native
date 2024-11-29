import { RouterUtil } from './RouterUtil';
import { RouterController } from '../controllers/RouterController';
import { NetworkController } from '../controllers/NetworkController';
import { AccountController } from '../controllers/AccountController';
import { ConnectorController } from '../controllers/ConnectorController';
import type { CaipNetwork } from '../utils/TypeUtil';

export const NetworkUtil = {
  async handleNetworkSwitch(network: CaipNetwork) {
    const { isConnected } = AccountController.state;
    const { caipNetwork, approvedCaipNetworkIds, supportsAllNetworks } = NetworkController.state;
    const isAuthConnected = ConnectorController.state.connectedConnector === 'AUTH';

    if (isConnected && caipNetwork?.id !== network.id) {
      if (approvedCaipNetworkIds?.includes(network.id) && !isAuthConnected) {
        await NetworkController.switchActiveNetwork(network);
        RouterUtil.navigateAfterNetworkSwitch(['ConnectingSiwe']);

        return { type: 'SWITCH_NETWORK', networkId: network.id };
      } else if (supportsAllNetworks || isAuthConnected) {
        RouterController.push('SwitchNetwork', { network });
      }
    } else if (!isConnected) {
      NetworkController.setCaipNetwork(network);
      RouterController.push('Connect');
    }

    return;
  }
};
