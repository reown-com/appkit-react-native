import { proxy, subscribe as sub } from 'valtio/vanilla';
import { ApiController } from './ApiController';
import { OptionsController } from './OptionsController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type { Event } from '../utils/TypeUtil';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getAnalyticsUrl();
const api = new FetchUtil({ baseUrl });
const excluded = ['MODAL_CREATED'];

// -- Types --------------------------------------------- //
export interface EventsControllerState {
  timestamp: number;
  data: Event;
}

// -- State --------------------------------------------- //
const state = proxy<EventsControllerState>({
  timestamp: Date.now(),
  data: {
    type: 'track',
    event: 'MODAL_CREATED' // just for init purposes
  }
});

// -- Controller ---------------------------------------- //
export const EventsController = {
  state,

  subscribe(callback: (newState: EventsControllerState) => void) {
    return sub(state, () => callback(state));
  },

  async _sendAnalyticsEvent(data: EventsControllerState['data'], timestamp: number) {
    if (excluded.includes(data.event)) {
      return;
    }

    try {
      await api.post({
        path: '/e',
        headers: ApiController._getApiHeaders(),
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
  }
};
