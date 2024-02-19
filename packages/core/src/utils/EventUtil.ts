import type { Platform, WcWallet } from './TypeUtil';

export const EventUtil = {
  getWalletPlatform(
    wallet: WcWallet,
    installed?: boolean,
    external?: boolean
  ): Platform | undefined {
    if (external) {
      return 'external';
    }

    if (installed) {
      return 'mobile';
    }

    if (wallet.mobile_link && wallet.webapp_link) {
      return undefined;
    }
    if (wallet.mobile_link) {
      return 'mobile';
    }
    if (wallet.webapp_link) {
      return 'web';
    }

    return undefined;
  }
};
