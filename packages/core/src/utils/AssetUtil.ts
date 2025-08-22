import { AssetController } from '../controllers/AssetController';
import type { CaipNetwork, Connector, WcWallet } from './TypeUtil';

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

  getNetworkImage(network?: CaipNetwork, networkImages?: Record<string, string>) {
    if (!network) {
      return undefined;
    }

    if (network.imageUrl) {
      return network.imageUrl;
    }

    if (network.imageId) {
      return networkImages?.[network.imageId];
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
