import type { SocialProvider } from '@reown/appkit-common-react-native';
import { proxy, subscribe as sub } from 'valtio';

// -- Types --------------------------------------------- //
export interface WebviewControllerState {
  frameViewVisible: boolean;
  webviewVisible: boolean;
  webviewUrl?: string;
  connecting?: boolean;
  connectingProvider?: SocialProvider;
}

// -- State --------------------------------------------- //
const state = proxy<WebviewControllerState>({
  frameViewVisible: false,
  webviewVisible: false,
  connecting: false,
  connectingProvider: undefined
});

// -- Controller ---------------------------------------- //
export const WebviewController = {
  state,

  subscribe(callback: (newState: WebviewControllerState) => void) {
    return sub(state, () => callback(state));
  },

  setFrameViewVisible(frameViewVisible: WebviewControllerState['frameViewVisible']) {
    state.frameViewVisible = frameViewVisible;
  },

  setWebviewVisible(visible: WebviewControllerState['webviewVisible']) {
    state.webviewVisible = visible;
  },

  setWebviewUrl(url: WebviewControllerState['webviewUrl']) {
    state.webviewUrl = url;
  },

  setConnecting(connecting: WebviewControllerState['connecting']) {
    state.connecting = connecting;
  },

  setConnectingProvider(provider: WebviewControllerState['connectingProvider']) {
    state.connectingProvider = provider;
  }
};
