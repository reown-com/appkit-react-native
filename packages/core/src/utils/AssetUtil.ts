import { AssetController } from '../controllers/AssetController';
import type { CaipNetwork, WcWallet } from './TypeUtils';

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
    if (network?.imageUrl) {
      return network?.imageUrl;
    }

    if (network?.imageId) {
      return AssetController.state.networkImages[network.imageId];
    }

    return undefined;
  }
};
