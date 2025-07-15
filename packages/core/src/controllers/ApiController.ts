import { Platform } from 'react-native';
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
import { OptionsController } from './OptionsController';
// import { ConnectorController } from './ConnectorController';
import { ConnectionController } from './ConnectionController';
import { ApiUtil } from '../utils/ApiUtil';
import { SnackController } from './SnackController';
import { ConnectionsController } from './ConnectionsController';
import { PresetsUtil } from '@reown/appkit-common-react-native';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getApiUrl();
const api = new FetchUtil({ baseUrl });
const defaultEntries = '48';
const recommendedEntries = '4';

// -- Types --------------------------------------------- //
export interface ApiControllerState {
  prefetchPromise?: Promise<unknown>;
  prefetchError?: boolean;
  prefetchLoading?: boolean;
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
      'User-Agent': ApiUtil.getUserAgent(),
      'origin': ApiUtil.getOrigin()
    };
  },

  async _fetchWalletImage(imageId: string) {
    const headers = ApiController._getApiHeaders();
    const url = await api.fetchImage(`/getWalletImage/${imageId}`, headers);
    if (url) {
      AssetController.setWalletImage(imageId, url);
    }
  },

  async _fetchConnectorImage(imageId: string) {
    const headers = ApiController._getApiHeaders();
    const url = await api.fetchImage(`/public/getAssetImage/${imageId}`, headers);
    if (url) {
      AssetController.setConnectorImage(imageId, url);
    }
  },

  async _fetchNetworkImage(networkId: string) {
    const imageId = PresetsUtil.NetworkImageIds[networkId];
    if (!imageId) {
      return;
    }

    const headers = ApiController._getApiHeaders();
    const url = await api.fetchImage(`/public/getAssetImage/${imageId}`, headers);
    if (url) {
      AssetController.setNetworkImage(networkId, url);
    }
  },

  async fetchConnectorImages() {
    //TODO: check this with coinbase
    const connectors = [{ imageId: PresetsUtil.ConnectorImageIds['WALLET_CONNECT'] }];
    const ids = connectors.map(({ imageId }) => imageId).filter(Boolean);
    await CoreHelperUtil.allSettled(
      (ids as string[]).map(id => ApiController._fetchConnectorImage(id))
    );
  },

  async fetchNetworkImages() {
    const networks = ConnectionsController.state.networks;
    if (networks) {
      await CoreHelperUtil.allSettled(
        networks.map(network => ApiController._fetchNetworkImage(network.id as string))
      );
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
        await CoreHelperUtil.allSettled(
          (walletImages as string[]).map(id => ApiController._fetchWalletImage(id))
        );
        state.installed = walletResponse.data;
        this.updateRecentWalletsInfo(walletResponse.data);
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

      this.updateRecentWalletsInfo(data);

      data.sort((a, b) => featuredWalletIds.indexOf(a.id) - featuredWalletIds.indexOf(b.id));
      const images = data.map(d => d.image_id).filter(Boolean);
      await CoreHelperUtil.allSettled(
        (images as string[]).map(id => ApiController._fetchWalletImage(id))
      );
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

    this.updateRecentWalletsInfo(data);

    const recent = await StorageUtil.getRecentWallets();
    const recommendedImages = data.map(d => d.image_id).filter(Boolean);
    const recentImages = recent.map(r => r.image_id).filter(Boolean);
    await CoreHelperUtil.allSettled(
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

    if (page === 1) {
      this.updateRecentWalletsInfo(data);
    }

    const images = data.map(w => w.image_id).filter(Boolean);
    await CoreHelperUtil.allSettled([
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
    await CoreHelperUtil.allSettled([
      ...(images as string[]).map(id => ApiController._fetchWalletImage(id)),
      CoreHelperUtil.wait(300)
    ]);
    state.search = data;
  },

  async updateRecentWalletsInfo(wallets: WcWallet[]) {
    let update = false;
    const recent = await StorageUtil.getRecentWallets();
    if (!recent.length) {
      return;
    }

    const updatedRecent = recent.map(r => {
      const wallet = wallets.find(w => w.id === r.id);
      if (wallet && JSON.stringify(wallet) !== JSON.stringify(r)) {
        update = true;

        return wallet;
      }

      return r;
    });

    if (update) {
      await StorageUtil.setRecentWallets(updatedRecent);
      ConnectionController.setRecentWallets(updatedRecent);
    }
  },

  async prefetch() {
    try {
      state.prefetchError = false;
      state.prefetchLoading = true;
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

      state.prefetchPromise = Promise.race([
        CoreHelperUtil.allSettled(promises),
        CoreHelperUtil.wait(3000)
      ]);

      state.prefetchPromise.then(() => {
        state.prefetchLoading = false;
      });
    } catch (error) {
      state.prefetchError = true;
      state.prefetchLoading = false;
      SnackController.showError('Failed to load wallets');
    }
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
