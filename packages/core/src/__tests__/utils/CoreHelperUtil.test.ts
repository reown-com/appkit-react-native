import { Linking } from 'react-native';
import type { DataWallet, SocialProvider } from '@reown/appkit-common-react-native';

import { CoreHelperUtil } from '../../utils/CoreHelperUtil';
import { OptionsController } from '../../controllers/OptionsController';

const WEB_WALLET_URL = 'https://web-wallet.walletconnect.org';
const WC_URI = 'wc:topic@2?relay-protocol=irn&symKey=key';
const ENCODED_WC_URI = encodeURIComponent(WC_URI);

describe('CoreHelperUtil', () => {
  afterEach(() => {
    OptionsController.setProjectId('');
  });

  describe('formatUniversalUrl', () => {
    it('should add the encoded provider and project id for social login', () => {
      OptionsController.setProjectId('test-project-id');
      const { redirect, href } = CoreHelperUtil.formatUniversalUrl(
        WEB_WALLET_URL,
        WC_URI,
        'google'
      );
      expect(redirect).toBe(
        `${WEB_WALLET_URL}/wc?uri=${ENCODED_WC_URI}&provider=google&projectId=test-project-id`
      );
      expect(href).toBe(`${WEB_WALLET_URL}/`);
    });

    it('should encode special characters in the provider and project id', () => {
      OptionsController.setProjectId('proj+id=1&x');
      const { redirect } = CoreHelperUtil.formatUniversalUrl(
        WEB_WALLET_URL,
        WC_URI,
        'email+test' as SocialProvider
      );
      expect(redirect).toBe(
        `${WEB_WALLET_URL}/wc?uri=${ENCODED_WC_URI}&provider=email%2Btest&projectId=proj%2Bid%3D1%26x`
      );
    });

    it('should omit the project id when it is blank', () => {
      OptionsController.setProjectId('  ');
      const { redirect } = CoreHelperUtil.formatUniversalUrl(WEB_WALLET_URL, WC_URI, 'email');
      expect(redirect).toBe(`${WEB_WALLET_URL}/wc?uri=${ENCODED_WC_URI}&provider=email`);
    });

    it('should not add the project id without a provider', () => {
      OptionsController.setProjectId('test-project-id');
      const { redirect } = CoreHelperUtil.formatUniversalUrl('https://wallet.example.com', WC_URI);
      expect(redirect).toBe(`https://wallet.example.com/wc?uri=${ENCODED_WC_URI}`);
    });
  });

  describe('formatNativeUrl', () => {
    it('should not add the project id to a native deep link', () => {
      OptionsController.setProjectId('test-project-id');
      const { redirect, href } = CoreHelperUtil.formatNativeUrl('wallet://', WC_URI);
      expect(redirect).toBe(`wallet://wc?uri=${ENCODED_WC_URI}`);
      expect(href).toBe('wallet://');
    });

    it('should not add the project id to a universal deep link', () => {
      OptionsController.setProjectId('test-project-id');
      const { redirect } = CoreHelperUtil.formatNativeUrl('https://wallet.example.com', WC_URI);
      expect(redirect).toBe(`https://wallet.example.com/wc?uri=${ENCODED_WC_URI}`);
    });
  });

  describe('checkInstalled (iOS)', () => {
    const globalAny = global as any;
    const originalApplication = globalAny.Application;
    const canOpenURL = Linking.canOpenURL as jest.Mock;

    afterEach(() => {
      globalAny.Application = originalApplication;
      canOpenURL.mockReset();
      canOpenURL.mockResolvedValue(false);
    });

    it('should use Application.isAppInstalled with the bare scheme when available', async () => {
      const isAppInstalled = jest.fn().mockResolvedValue(true);
      globalAny.Application = { isAppInstalled };

      const result = await CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' });

      expect(result).toBe(true);
      expect(isAppInstalled).toHaveBeenCalledWith('phantom');
      expect(canOpenURL).not.toHaveBeenCalled();
    });

    it('should return false when Application.isAppInstalled resolves false', async () => {
      globalAny.Application = { isAppInstalled: jest.fn().mockResolvedValue(false) };

      await expect(
        CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' })
      ).resolves.toBe(false);
    });

    it('should return false when Application.isAppInstalled rejects', async () => {
      globalAny.Application = { isAppInstalled: jest.fn().mockRejectedValue(new Error('boom')) };

      await expect(
        CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' })
      ).resolves.toBe(false);
    });

    it.each([
      ['metamask://', 'metamask'],
      ['metamask://wc?uri=abc', 'metamask'],
      ['  trust://  ', 'trust'],
      ['rainbow:', 'rainbow'],
      ['zerion', 'zerion']
    ])('should normalize %p to %p', async (deepLink, expected) => {
      const isAppInstalled = jest.fn().mockResolvedValue(true);
      globalAny.Application = { isAppInstalled };

      await CoreHelperUtil.checkInstalled({ id: '1', ios_schema: deepLink });

      expect(isAppInstalled).toHaveBeenCalledWith(expected);
    });

    it.each([undefined, '', '://'])('should return false without checking for %p', async scheme => {
      const isAppInstalled = jest.fn().mockResolvedValue(true);
      globalAny.Application = { isAppInstalled };

      const result = await CoreHelperUtil.checkInstalled({ id: '1', ios_schema: scheme });

      expect(result).toBe(false);
      expect(isAppInstalled).not.toHaveBeenCalled();
      expect(canOpenURL).not.toHaveBeenCalled();
    });

    it('should fall back to Linking.canOpenURL when isAppInstalled is not available', async () => {
      // e.g. expo-application owns global.Application (Expo Go)
      globalAny.Application = { applicationName: 'expo' };
      canOpenURL.mockResolvedValue(true);

      const result = await CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' });

      expect(result).toBe(true);
      expect(canOpenURL).toHaveBeenCalledWith('phantom://');
    });

    it.each([
      ['zerion', 'zerion://'],
      ['rainbow:', 'rainbow://'],
      ['metamask://wc?uri=abc', 'metamask://wc?uri=abc']
    ])('should pass a valid URL to Linking.canOpenURL for %p', async (deepLink, expected) => {
      globalAny.Application = undefined;
      canOpenURL.mockResolvedValue(true);

      await CoreHelperUtil.checkInstalled({ id: '1', ios_schema: deepLink });

      expect(canOpenURL).toHaveBeenCalledWith(expected);
    });

    it('should fall back to Linking.canOpenURL when global.Application is undefined', async () => {
      globalAny.Application = undefined;
      canOpenURL.mockResolvedValue(true);

      await expect(
        CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' })
      ).resolves.toBe(true);
    });

    it('should return false when Linking.canOpenURL rejects', async () => {
      globalAny.Application = undefined;
      canOpenURL.mockRejectedValue(new Error('Add phantom to LSApplicationQueriesSchemes'));

      await expect(
        CoreHelperUtil.checkInstalled({ id: '1', ios_schema: 'phantom://' })
      ).resolves.toBe(false);
    });
  });

  describe('checkInstalledInBatches', () => {
    const globalAny = global as any;
    const originalApplication = globalAny.Application;

    afterEach(() => {
      globalAny.Application = originalApplication;
    });

    const createWallets = (count: number): DataWallet[] =>
      Array.from({ length: count }, (_, i) => ({ id: `w${i}`, ios_schema: `w${i}://` }));

    it('should check every wallet and keep the input order', async () => {
      const installed = new Set(['w3', 'w21', 'w44']);
      const isAppInstalled = jest.fn(async (scheme: string) => installed.has(scheme));
      globalAny.Application = { isAppInstalled };

      const wallets = createWallets(45);
      const results = await CoreHelperUtil.checkInstalledInBatches(wallets, 20);

      expect(isAppInstalled).toHaveBeenCalledTimes(45);
      expect(results.map(({ id }) => id)).toEqual(wallets.map(({ id }) => id));
      expect(results.filter(r => r.isInstalled).map(r => r.id)).toEqual(['w3', 'w21', 'w44']);
    });

    it('should not run more than batchSize checks at the same time', async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      globalAny.Application = {
        isAppInstalled: jest.fn(async () => {
          inFlight++;
          maxInFlight = Math.max(maxInFlight, inFlight);
          await Promise.resolve();
          inFlight--;

          return false;
        })
      };

      await CoreHelperUtil.checkInstalledInBatches(createWallets(45), 20);

      expect(maxInFlight).toBe(20);
    });

    it('should yield to the event loop between batches', async () => {
      const isAppInstalled = jest.fn().mockResolvedValue(false);
      globalAny.Application = { isAppInstalled };

      let callsWhenTimerFired = -1;
      setTimeout(() => {
        callsWhenTimerFired = isAppInstalled.mock.calls.length;
      }, 0);

      await CoreHelperUtil.checkInstalledInBatches(createWallets(45), 20);

      // The timer queued before the checks runs after the first batch, not after all of them
      expect(callsWhenTimerFired).toBe(20);
    });

    it('should return an empty array for no wallets', async () => {
      await expect(CoreHelperUtil.checkInstalledInBatches([])).resolves.toEqual([]);
      await expect(CoreHelperUtil.checkInstalledInBatches(undefined)).resolves.toEqual([]);
    });
  });
});
