import type { AppKitNetwork, WcWallet } from '@reown/appkit-common-react-native';

export const AssetUtil = {
  getWalletImage(wallet?: WcWallet, walletImages?: Record<string, string>) {
    if (wallet?.image_url) {
      return wallet?.image_url;
    }

    if (wallet?.image_id) {
      return walletImages?.[wallet.image_id];
    }

    return undefined;
  },

  getNetworkImage(network?: AppKitNetwork, networkImages?: Record<string, string>) {
    if (!network) {
      return undefined;
    }

    if (network?.imageUrl) {
      return network.imageUrl;
    }

    return networkImages?.[network?.id];
  }
};
