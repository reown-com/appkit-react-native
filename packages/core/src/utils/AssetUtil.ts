import { AssetController } from '../controllers/AssetController';
import type { WcWallet } from './TypeUtil';

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

  getConnectorImage(imageId?: string) {
    if (imageId) {
      return AssetController.state.connectorImages[imageId];
    }

    return undefined;
  }
};
