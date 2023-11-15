import { Image, Platform } from 'react-native';
import { subscribeKey as subKey } from 'valtio/utils';
import { proxy } from 'valtio/vanilla';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type {
  ApiGetDataWalletsResponse,
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  SdkVersion,
  WcWallet
} from '../utils/TypeUtils';
import { AssetController } from './AssetController';
import { NetworkController } from './NetworkController';
import { OptionsController } from './OptionsController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getApiUrl();
const api = new FetchUtil({ baseUrl });
const defaultEntries = '48';
const recommendedEntries = '4';
const sdkType = 'w3m';

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  prefetchPromise?: Promise<unknown>;
  sdkVersion: SdkVersion;
  page: number;
  count: number;
  featured: WcWallet[];
  recommended: WcWallet[];
  installed: WcWallet[];
  wallets: WcWallet[];
  search: WcWallet[];
}

type StateKey = keyof ApiControllerState;

// -- State --------------------------------------------- //
const state = proxy<ApiControllerState>({
  sdkVersion: 'react-native-undefined',
  page: 1,
  count: 0,
  featured: [],
  recommended: [],
  wallets: [],
  search: [],
  installed: []
});

// -- Controller ---------------------------------------- //
export const ApiController = {
  state,

  platform() {
    return Platform.select({ default: 'ios', android: 'android' });
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: ApiControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setSdkVersion(sdkVersion: ApiControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion;
  },

  _getApiHeaders() {
    return {
      'x-project-id': OptionsController.state.projectId,
      'x-sdk-type': sdkType,
      'x-sdk-version': state.sdkVersion,
      'User-Agent': `${Platform.OS}-${Platform.Version}`
    };
  },

  async _fetchWalletImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`;
    AssetController.setWalletImage(imageId, imageUrl);
  },

  async _fetchNetworkImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`;
    Image.getSizeWithHeaders(imageUrl, ApiController._getApiHeaders(), () => {});
    AssetController.setNetworkImage(imageId, imageUrl);
  },

  async fetchNetworkImages() {
    const { requestedCaipNetworks } = NetworkController.state;
    const ids = requestedCaipNetworks?.map(({ imageId }) => imageId).filter(Boolean);
    if (ids) {
      await Promise.allSettled((ids as string[]).map(id => ApiController._fetchNetworkImage(id)));
    }
  },

  async fetchInstalledWallets() {
    const path = Platform.select({ default: 'getIosData', android: 'getAndroidData' });
    const { data: walletData } = await api.get<ApiGetDataWalletsResponse>({
      path,
      headers: ApiController._getApiHeaders()
    });

    const promises = walletData.map(async item => {
      return {
        id: item.id,
        isInstalled: await CoreHelperUtil.checkInstalled(item)
      };
    });

    const results = await Promise.all(promises);
    const installed = results.filter(({ isInstalled }) => isInstalled).map(({ id }) => id);
    const { excludeWalletIds } = OptionsController.state;

    if (installed.length > 0) {
      const { data } = await api.get<ApiGetWalletsResponse>({
        path: '/getWallets',
        headers: ApiController._getApiHeaders(),
        params: {
          page: '1',
          platform: this.platform(),
          entries: installed?.length.toString(),
          include: installed?.join(','),
          exclude: excludeWalletIds?.join(',')
        }
      });

      const walletImages = data.map(d => d.image_id).filter(Boolean);
      await Promise.allSettled(
        (walletImages as string[]).map(id => ApiController._fetchWalletImage(id))
      );

      state.installed = data;
    }
  },

  async fetchFeaturedWallets() {
    const { featuredWalletIds } = OptionsController.state;
    const exclude = state.installed.map(({ id }) => id);

    if (featuredWalletIds?.length) {
      const { data } = await api.get<ApiGetWalletsResponse>({
        path: '/getWallets',
        headers: ApiController._getApiHeaders(),
        params: {
          page: '1',
          platform: this.platform(),
          entries: featuredWalletIds?.length
            ? String(featuredWalletIds.length)
            : recommendedEntries,
          include: featuredWalletIds?.join(','),
          exclude: exclude?.join(',')
        }
      });
      data.sort((a, b) => featuredWalletIds.indexOf(a.id) - featuredWalletIds.indexOf(b.id));
      const images = data.map(d => d.image_id).filter(Boolean);
      await Promise.allSettled((images as string[]).map(id => ApiController._fetchWalletImage(id)));
      state.featured = data;
    }
  },

  async fetchRecommendedWallets() {
    const { installed } = ApiController.state;
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state;

    const exclude = [
      ...installed.map(({ id }) => id),
      ...(excludeWalletIds ?? []),
      ...(featuredWalletIds ?? [])
    ].filter(Boolean);

    const { data, count } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: '1',
        platform: this.platform(),
        entries: recommendedEntries,
        include: includeWalletIds?.join(','),
        exclude: exclude?.join(',')
      }
    });
    const recent = await StorageUtil.getRecentWallets();
    const recommendedImages = data.map(d => d.image_id).filter(Boolean);
    const recentImages = recent.map(r => r.image_id).filter(Boolean);
    await Promise.allSettled(
      ([...recommendedImages, ...recentImages] as string[]).map(id =>
        ApiController._fetchWalletImage(id)
      )
    );
    state.recommended = data;
    state.count = count ?? 0;
  },

  async fetchWallets({ page }: Pick<ApiGetWalletsRequest, 'page'>) {
    const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state;
    const exclude = [
      ...state.installed.map(({ id }) => id),
      ...state.recommended.map(({ id }) => id),
      ...(excludeWalletIds ?? []),
      ...(featuredWalletIds ?? [])
    ].filter(Boolean);
    const { data, count } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: String(page),
        platform: this.platform(),
        entries: String(defaultEntries),
        include: includeWalletIds?.join(','),
        exclude: exclude.join(',')
      }
    });

    const images = data.map(w => w.image_id).filter(Boolean);
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ]);
    state.wallets = [...state.wallets, ...data];
    state.count = count > state.count ? count : state.count;
    state.page = page;
  },

  async searchWallet({ search }: Pick<ApiGetWalletsRequest, 'search'>) {
    const { includeWalletIds, excludeWalletIds } = OptionsController.state;
    state.search = [];
    const { data } = await api.get<ApiGetWalletsResponse>({
      path: '/getWallets',
      headers: ApiController._getApiHeaders(),
      params: {
        page: '1',
        platform: this.platform(),
        entries: String(defaultEntries),
        search,
        include: includeWalletIds?.join(','),
        exclude: excludeWalletIds?.join(',')
      }
    });
    const images = data.map(w => w.image_id).filter(Boolean);
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ]);
    state.search = data;
  },

  async prefetch() {
    await ApiController.fetchInstalledWallets();

    state.prefetchPromise = Promise.race([
      Promise.allSettled([
        ApiController.fetchFeaturedWallets(),
        ApiController.fetchRecommendedWallets(),
        ApiController.fetchNetworkImages()
      ]),
      CoreHelperUtil.wait(3000)
    ]);
  }
};
