import { Image, Platform } from 'react-native';
import { subscribeKey as subKey } from 'valtio/utils';
import { proxy } from 'valtio';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type {
  ApiGetAnalyticsConfigResponse,
  ApiGetDataWalletsResponse,
  ApiGetWalletsRequest,
  ApiGetWalletsResponse,
  WcWallet
} from '../utils/TypeUtil';
import { AssetController } from './AssetController';
import { NetworkController } from './NetworkController';
import { OptionsController } from './OptionsController';
import { ConnectorController } from './ConnectorController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getApiUrl();
const api = new FetchUtil({ baseUrl });
const defaultEntries = '48';
const recommendedEntries = '4';

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  prefetchPromise?: Promise<unknown>;
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

  _getApiHeaders() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state;

    return {
      'x-project-id': projectId,
      'x-sdk-type': sdkType,
      'x-sdk-version': sdkVersion,
      'User-Agent': `${Platform.OS}-${Platform.Version}`
    };
  },

  async _fetchWalletImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`;
    AssetController.setWalletImage(imageId, imageUrl);
  },

  async _fetchConnectorImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`;
    Image.getSizeWithHeaders(imageUrl, ApiController._getApiHeaders(), () => {});
    AssetController.setConnectorImage(imageId, imageUrl);
  },

  async _fetchNetworkImage(imageId: string) {
    const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`;
    Image.getSizeWithHeaders(imageUrl, ApiController._getApiHeaders(), () => {});
    AssetController.setNetworkImage(imageId, imageUrl);
  },

  async fetchConnectorImages() {
    const { connectors } = ConnectorController.state;
    const ids = connectors.map(({ imageId }) => imageId).filter(Boolean);
    await Promise.allSettled((ids as string[]).map(id => ApiController._fetchConnectorImage(id)));
  },

  async fetchNetworkImages() {
    const { requestedCaipNetworks } = NetworkController.state;
    const ids = requestedCaipNetworks?.map(({ imageId }) => imageId).filter(Boolean);
    if (ids) {
      await Promise.allSettled((ids as string[]).map(id => ApiController._fetchNetworkImage(id)));
    }
  },

  async fetchInstalledWallets() {
    const { includeWalletIds } = OptionsController.state;
    const path = Platform.select({ default: 'getIosData', android: 'getAndroidData' });
    const response = await api.get<ApiGetDataWalletsResponse>({
      path,
      headers: ApiController._getApiHeaders()
    });

    if (!response) return;

    let { data: walletData } = response;

    if (includeWalletIds?.length) {
      walletData = walletData.filter(({ id }) => includeWalletIds.includes(id));
    }

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
      const walletResponse = await api.get<ApiGetWalletsResponse>({
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

      if (walletResponse?.data) {
        const walletImages = walletResponse.data.map(d => d.image_id).filter(Boolean);
        await Promise.allSettled(
          (walletImages as string[]).map(id => ApiController._fetchWalletImage(id))
        );
        state.installed = walletResponse.data;
      }
    }
  },

  async fetchFeaturedWallets() {
    const { featuredWalletIds } = OptionsController.state;
    const exclude = state.installed.map(({ id }) => id);

    if (featuredWalletIds?.length) {
      const response = await api.get<ApiGetWalletsResponse>({
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
      if (!response) return;
      const { data } = response;

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

    const response = await api.get<ApiGetWalletsResponse>({
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

    if (!response) return;
    const { data, count } = response;

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
    const response = await api.get<ApiGetWalletsResponse>({
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

    if (!response) return;
    const { data, count } = response;

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
    const response = await api.get<ApiGetWalletsResponse>({
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

    if (!response) return;
    const { data } = response;

    const images = data.map(w => w.image_id).filter(Boolean);
    await Promise.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ]);
    state.search = data;
  },

  async prefetch() {
    // this fetch must resolve first so we filter them in the other wallet requests
    await ApiController.fetchInstalledWallets();

    const promises = [
      ApiController.fetchFeaturedWallets(),
      ApiController.fetchRecommendedWallets(),
      ApiController.fetchNetworkImages(),
      ApiController.fetchConnectorImages()
    ];
    if (OptionsController.state.enableAnalytics === undefined) {
      promises.push(ApiController.fetchAnalyticsConfig());
    }
    state.prefetchPromise = Promise.race([Promise.allSettled(promises), CoreHelperUtil.wait(3000)]);
  },

  async fetchAnalyticsConfig() {
    const response = await api.get<ApiGetAnalyticsConfigResponse>({
      path: '/getAnalyticsConfig',
      headers: ApiController._getApiHeaders()
    });
    if (!response) return;
    OptionsController.setEnableAnalytics(response.isAnalyticsEnabled);
  }
};
