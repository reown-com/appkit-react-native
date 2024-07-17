/* eslint-disable no-bitwise */

import { Linking, Platform } from 'react-native';
import { ConstantsUtil as CommonConstants } from '@web3modal/common-react-native';

import { ConstantsUtil } from './ConstantsUtil';
import type { CaipAddress, DataWallet, LinkingRecord } from './TypeUtil';

// -- Helpers -----------------------------------------------------------------
async function isAppInstalledIos(deepLink?: string): Promise<boolean> {
  try {
    return deepLink ? Linking.canOpenURL(deepLink) : Promise.resolve(false);
  } catch (error) {
    return Promise.resolve(false);
  }
}

async function isAppInstalledAndroid(packageName?: string): Promise<boolean> {
  try {
    //@ts-ignore
    if (!packageName || typeof global?.Application?.isAppInstalled !== 'function') {
      return Promise.resolve(false);
    }

    //@ts-ignore
    return global?.Application?.isAppInstalled(packageName);
  } catch (error) {
    return Promise.resolve(false);
  }
}

// -- Utility --------------------------------------------------------------------
export const CoreHelperUtil = {
  isPairingExpired(expiry?: number) {
    return expiry ? expiry - Date.now() <= ConstantsUtil.TEN_SEC_MS : true;
  },

  isAllowedRetry(lastRetry: number) {
    return Date.now() - lastRetry >= ConstantsUtil.ONE_SEC_MS;
  },

  getPairingExpiry() {
    return Date.now() + ConstantsUtil.FOUR_MINUTES_MS;
  },

  getNetworkId(caipAddress: CaipAddress | undefined) {
    return caipAddress?.split(':')[1];
  },

  getPlainAddress(caipAddress: CaipAddress | undefined) {
    return caipAddress?.split(':')[2];
  },

  async wait(milliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  },

  debounce(func: (...args: any[]) => unknown, timeout = 500) {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: unknown[]) => {
      function next() {
        func(...args);
      }
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(next, timeout);
    };
  },

  isHttpUrl(url: string) {
    return url.startsWith('http://') || url.startsWith('https://');
  },

  formatNativeUrl(appUrl: string, wcUri: string): LinkingRecord {
    if (CoreHelperUtil.isHttpUrl(appUrl)) {
      return this.formatUniversalUrl(appUrl, wcUri);
    }
    let safeAppUrl = appUrl;
    if (!safeAppUrl.includes('://')) {
      safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '');
      safeAppUrl = `${safeAppUrl}://`;
    }
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`;
    }
    const encodedWcUrl = encodeURIComponent(wcUri);

    return {
      redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
      href: safeAppUrl
    };
  },

  formatUniversalUrl(appUrl: string, wcUri: string): LinkingRecord {
    if (!CoreHelperUtil.isHttpUrl(appUrl)) {
      return this.formatNativeUrl(appUrl, wcUri);
    }
    let safeAppUrl = appUrl;
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`;
    }
    const encodedWcUrl = encodeURIComponent(wcUri);

    return {
      redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
      href: safeAppUrl
    };
  },

  async openLink(url: string) {
    try {
      await Linking.openURL(url);
    } catch (error) {
      throw new Error(ConstantsUtil.LINKING_ERROR);
    }
  },

  formatBalance(balance: string | undefined, symbol: string | undefined, decimals = 3) {
    let formattedBalance;

    if (balance === '0') {
      formattedBalance = '0.000';
    } else if (typeof balance === 'string') {
      const number = Number(balance);
      if (number) {
        const regex = new RegExp(`^-?\\d+(?:\\.\\d{0,${decimals}})?`, 'u');
        formattedBalance = number.toString().match(regex)?.[0];
      }
    }

    return formattedBalance ? `${formattedBalance} ${symbol}` : `0.000 ${symbol || ''}`;
  },

  getApiUrl() {
    return CommonConstants.W3M_API_URL;
  },

  getBlockchainApiUrl() {
    return CommonConstants.BLOCKCHAIN_API_RPC_URL;
  },

  getAnalyticsUrl() {
    return CommonConstants.PULSE_API_URL;
  },

  getUUID() {
    if ((global as any)?.crypto.getRandomValues) {
      const buffer = new Uint8Array(16);
      (global as any)?.crypto.getRandomValues(buffer);

      // Set the version (4) and variant (8, 9, A, or B) bits
      buffer[6] = (buffer[6] ?? 0 & 0x0f) | 0x40;
      buffer[8] = (buffer[8] ?? 0 & 0x3f) | 0x80;

      // Convert the buffer to a hexadecimal string
      const hexString = Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
      const formatted = `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(
        12,
        16
      )}-${hexString.slice(16, 20)}-${hexString.slice(20)}`;

      return formatted;
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;

      return v.toString(16);
    });
  },

  getBundleId() {
    if ((global as any)?.Application?.applicationId) {
      return (global as any)?.Application?.applicationId;
    }

    return undefined;
  },

  parseError(error: any): string {
    if (typeof error === 'string') {
      return error;
    } else if (typeof error?.issues?.[0]?.message === 'string') {
      return error.issues[0].message;
    } else if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  },

  async checkInstalled(wallet: DataWallet): Promise<boolean> {
    let isInstalled = false;
    const scheme = wallet.ios_schema;
    const appId = wallet.android_app_id;
    try {
      isInstalled = await Platform.select({
        ios: isAppInstalledIos(scheme),
        android: isAppInstalledAndroid(appId),
        default: Promise.resolve(false)
      });
    } catch {
      isInstalled = false;
    }

    return isInstalled;
  },

  isValidEmail(email: string) {
    return ConstantsUtil.EMAIL_REGEX.test(email);
  },

  allSettled(promises: Promise<unknown>[]) {
    return Promise.all(
      promises.map(promise =>
        promise
          .then(value => ({ status: 'fulfilled', value }))
          .catch(reason => ({ status: 'rejected', reason }))
      )
    );
  }
};
