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
    if (!network || !network?.imageId) {
      return undefined;
    }

    if (network?.imageUrl) {
      return network.imageUrl;
    }

    return networkImages?.[network?.imageId];
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
