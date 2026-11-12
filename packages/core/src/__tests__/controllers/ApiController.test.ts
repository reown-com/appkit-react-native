import type { CustomWallet, DataWallet, WcWallet } from '@reown/appkit-common-react-native';

import { ApiController, OptionsController } from '../../index';
import { CoreHelperUtil } from '../../utils/CoreHelperUtil';
import { FetchUtil } from '../../utils/FetchUtil';

// -- Helpers ------------------------------------------------------------------
const createDataWallets = (count: number): DataWallet[] =>
  Array.from({ length: count }, (_, i) => ({ id: `w${i}`, ios_schema: `w${i}://` }));

const toWcWallet = (id: string) => ({ id, name: id }) as WcWallet;

function mockApi(dataWallets: DataWallet[]) {
  const getSpy = jest.spyOn(FetchUtil.prototype, 'get').mockImplementation((async (args: {
    path?: string;
    params?: Record<string, string>;
  }) => {
    // The shared Platform.select mock only resolves `ios` keys, so the data path may be undefined
    if (!args.path || args.path === 'getIosData' || args.path === 'getAndroidData') {
      return { data: dataWallets };
    }
    if (args.path === '/getWallets') {
      const include = args.params?.['include']?.split(',').filter(Boolean) ?? [];

      return { data: include.map(toWcWallet), count: include.length };
    }

    return undefined;
  }) as any);
  jest.spyOn(FetchUtil.prototype, 'fetchImage').mockResolvedValue(undefined as any);

  return getSpy;
}

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      recommended: [],
      featured: [],
      installed: [],
      wallets: [],
      search: []
    });
  });

  describe('fetchInstalledWallets', () => {
    const globalAny = global as any;
    const originalApplication = globalAny.Application;

    afterEach(() => {
      jest.restoreAllMocks();
      globalAny.Application = originalApplication;
      OptionsController.setIncludeWalletIds(undefined);
      OptionsController.setExcludeWalletIds(undefined);
      OptionsController.setCustomWallets(undefined);
      ApiController.state.installed = [];
    });

    it('should check every wallet in batches and request the installed ones', async () => {
      const installed = new Set(['w0', 'w25', 'w59']);
      globalAny.Application = {
        isAppInstalled: jest.fn(async (scheme: string) => installed.has(scheme))
      };
      const getSpy = mockApi(createDataWallets(60));
      const batchSpy = jest.spyOn(CoreHelperUtil, 'checkInstalledInBatches');

      await ApiController.fetchInstalledWallets();

      expect(globalAny.Application.isAppInstalled).toHaveBeenCalledTimes(60);
      expect(batchSpy).toHaveBeenCalled();
      const walletsCall = getSpy.mock.calls.find(([args]) => args.path === '/getWallets');
      expect(walletsCall?.[0].params?.['include']).toBe('w0,w25,w59');
      expect(ApiController.state.installed.map(({ id }) => id)).toEqual(['w0', 'w25', 'w59']);
    });

    it('should not check wallets listed in excludeWalletIds', async () => {
      const isAppInstalled = jest.fn().mockResolvedValue(true);
      globalAny.Application = { isAppInstalled };
      OptionsController.setExcludeWalletIds(['w1', 'w3']);
      const getSpy = mockApi(createDataWallets(5));

      await ApiController.fetchInstalledWallets();

      const checkedSchemes = isAppInstalled.mock.calls.map(([scheme]) => scheme);
      expect(checkedSchemes).toEqual(['w0', 'w2', 'w4']);
      const walletsCall = getSpy.mock.calls.find(([args]) => args.path === '/getWallets');
      expect(walletsCall?.[0].params?.['include']).toBe('w0,w2,w4');
      expect(walletsCall?.[0].params?.['exclude']).toBe('w1,w3');
    });

    it('should only check wallets listed in includeWalletIds', async () => {
      const isAppInstalled = jest.fn().mockResolvedValue(true);
      globalAny.Application = { isAppInstalled };
      OptionsController.setIncludeWalletIds(['w2', 'w4']);
      mockApi(createDataWallets(5));

      await ApiController.fetchInstalledWallets();

      expect(isAppInstalled.mock.calls.map(([scheme]) => scheme)).toEqual(['w2', 'w4']);
    });

    it('should still check custom wallets and merge them after API wallets', async () => {
      const installed = new Set(['w1', 'custom-a']);
      globalAny.Application = {
        isAppInstalled: jest.fn(async (scheme: string) => installed.has(scheme))
      };
      const customWallets = [
        { id: 'custom-a', name: 'Custom A', ios_schema: 'custom-a://' },
        { id: 'custom-b', name: 'Custom B', ios_schema: 'custom-b://' }
      ] as unknown as CustomWallet[];
      OptionsController.setCustomWallets(customWallets);
      mockApi(createDataWallets(3));

      await ApiController.fetchInstalledWallets();

      expect(globalAny.Application.isAppInstalled).toHaveBeenCalledWith('custom-a');
      expect(globalAny.Application.isAppInstalled).toHaveBeenCalledWith('custom-b');
      expect(ApiController.state.installed.map(({ id }) => id)).toEqual(['w1', 'custom-a']);
    });

    it('should not request /getWallets when nothing is installed', async () => {
      globalAny.Application = { isAppInstalled: jest.fn().mockResolvedValue(false) };
      const getSpy = mockApi(createDataWallets(3));

      await ApiController.fetchInstalledWallets();

      expect(getSpy.mock.calls.some(([args]) => args.path === '/getWallets')).toBe(false);
      expect(ApiController.state.installed).toEqual([]);
    });
  });
});
