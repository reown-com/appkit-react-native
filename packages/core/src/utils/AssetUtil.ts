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

  getNetworkImage(networkId?: string | number) {
    //TODO: check if imageUrl case is needed

    if (networkId) {
      return AssetController.state.networkImages[networkId];
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
