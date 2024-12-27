import type { CaipNetwork } from '@reown/appkit-common-react-native';
import { AssetController } from '../controllers/AssetController';
import type { Connector, WcWallet } from './TypeUtil';

export const AssetUtil = {
  getWalletImage(wallet?: WcWallet) {
    if (wallet?.image_url) {
      return wallet?.image_url;
    }

    if (wallet?.image_id) {
      return AssetController.state.walletImages[wallet.image_id];
    }

    return undefined;
  },

  getNetworkImage(network?: CaipNetwork) {
    if (network?.assets?.imageUrl) {
      return network.assets.imageUrl;
    }

    if (network?.assets?.imageId) {
      return AssetController.state.networkImages[network.assets.imageId];
    }

    return undefined;
  },

  getConnectorImage(connector?: Connector) {
    if (connector?.imageUrl) {
      return connector.imageUrl;
    }

    if (connector?.imageId) {
      return AssetController.state.connectorImages[connector.imageId];
    }

    return undefined;
  }
};
