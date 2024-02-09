import { proxy, subscribe as sub } from 'valtio/vanilla';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type { Event } from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';
import { ApiController } from './ApiController';

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

  async _sendAnalyticsEvent(payload: EventsControllerState) {
    if (excluded.includes(payload.data.event)) {
      return;
    }
    try {
      await api.post({
        path: '/e',
        headers: ApiController._getApiHeaders(),
        body: {
          // eventId: CoreHelperUtil.getUUID(),
          // url: window.location.href,
          // domain: window.location.hostname,
          timestamp: payload.timestamp,
          props: payload.data
        }
      });
    } catch {
      // Catch silently
    }
  },

  sendEvent(data: EventsControllerState['data']) {
    state.timestamp = Date.now();
    state.data = data;
    if (OptionsController.state.enableAnalytics) {
      EventsController._sendAnalyticsEvent(state);
    }
  }
};
