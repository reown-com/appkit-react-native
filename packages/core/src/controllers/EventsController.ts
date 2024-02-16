import { Platform } from 'react-native';
import { proxy, subscribe as sub } from 'valtio/vanilla';
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

  _getApiHeaders() {
    const { projectId, sdkType, sdkVersion } = OptionsController.state;

    return {
      'x-project-id': projectId,
      'x-sdk-type': sdkType,
      'x-sdk-version': sdkVersion,
      'User-Agent': `${Platform.OS}-${Platform.Version}`,
      'Content-Type': 'application/json'
    };
  },

  async _sendAnalyticsEvent(payload: EventsControllerState) {
    if (excluded.includes(payload.data.event)) {
      return;
    }

    try {
      await api.post({
        path: '/e',
        headers: this._getApiHeaders(),
        body: {
          eventId: CoreHelperUtil.getUUID(),
          bundleId: CoreHelperUtil.getBundleId(),
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
