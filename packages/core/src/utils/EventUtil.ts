import type { Platform, WcWallet } from './TypeUtil';

export const EventUtil = {
  getWalletPlatform(wallet: WcWallet, installed?: boolean): Platform | undefined {
    if (installed) {
      return 'mobile';
    }

    if (wallet.mobile_link && wallet.webapp_link) {
      // if we cannot assure what platform the wallet is, we return undefined
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
