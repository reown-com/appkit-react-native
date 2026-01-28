import { proxy, subscribe as sub } from 'valtio';
import { ApiController } from './ApiController';
import { OptionsController } from './OptionsController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type {
  Event,
  EventName,
  WalletImpressionItem,
  WcWallet
} from '@reown/appkit-common-react-native';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl();
const api = new FetchUtil({ baseUrl });
const excluded = ['MODAL_CREATED'];
const IMPRESSION_TIMEOUT = 3000;

// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number;
  data: Event;
  pendingWalletImpressions: WalletImpressionItem[];
  pendingImpressionTimeout?: NodeJS.Timeout;
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  data: {
    type: 'track',
    event: 'MODAL_CREATED' // just for init purposes
  },
  pendingWalletImpressions: [],
  pendingImpressionTimeout: undefined
});

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state), true);
  },

  subscribeEvent(event: EventName, callback: (newEvent: EventsControllerState) => void) {
    return sub(
      state,
      () => {
        if (state.data.event === event) {
          callback(state);
        }
      },
      true
    );
  },

  trackWalletImpression(props: {
    wallet: WcWallet;
    view: 'Connect' | 'AllWallets';
    displayIndex: number;
    query?: string;
    installed?: boolean;
  }) {
    state.pendingWalletImpressions.push({
      name: props.wallet.name ?? 'Unknown',
      walletRank: props.wallet.order,
      explorerId: props.wallet.id,
      certified: props.wallet.badge_type === 'certified',
      displayIndex: props.displayIndex,
      view: props.view,
      query: props.query,
      installed: props.installed
    });

    if (state.pendingImpressionTimeout) {
      clearTimeout(state.pendingImpressionTimeout);
    }

    state.pendingImpressionTimeout = setTimeout(() => {
      EventsController.sendWalletImpressions();
    }, IMPRESSION_TIMEOUT);
  },

  sendWalletImpressions() {
    if (state.pendingImpressionTimeout) {
      clearTimeout(state.pendingImpressionTimeout);
      state.pendingImpressionTimeout = undefined;
    }

    const impressions = state.pendingWalletImpressions;

    if (impressions.length === 0) {
      return;
    }

    state.pendingWalletImpressions = [];
    EventsController.sendEvent({
      type: 'track',
      event: 'WALLET_IMPRESSION',
      items: impressions
    });
  },

  async _sendAnalyticsEvent(data: EventsControllerState['data'], timestamp: number) {
    if (excluded.includes(data.event)) {
      return;
    }

    try {
      await api.post({
        path: '/e',
        headers: ApiController._getApiHeaders(),
        params: ApiController._getApiParams(),
        body: {
          eventId: CoreHelperUtil.getUUID(),
          bundleId: CoreHelperUtil.getBundleId(),
          timestamp,
          props: data
        }
      });
    } catch {
      // Catch silently
    }
  },

  async sendEvent(data: EventsControllerState['data']) {
    const timestamp = Date.now();
    state.timestamp = timestamp;
    state.data = data;
    await ApiController.state.prefetchPromise;

    if (OptionsController.state.enableAnalytics) {
      EventsController._sendAnalyticsEvent(data, timestamp);
    }
  },

  resetState() {
    if (state.pendingImpressionTimeout) {
      clearTimeout(state.pendingImpressionTimeout);
      state.pendingImpressionTimeout = undefined;
    }
    state.pendingWalletImpressions = [];
    state.data = {
      type: 'track',
      event: 'MODAL_CREATED'
    };
    state.timestamp = Date.now();
  }
};
