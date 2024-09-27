import { proxy, subscribe as sub } from 'valtio';

// -- Types --------------------------------------------- //
export interface WebviewControllerState {
  frameViewVisible: boolean;
  webviewVisible: boolean;
  webviewUrl?: string;
  connecting?: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<WebviewControllerState>({
  frameViewVisible: false,
  webviewVisible: false,
  connecting: false
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
  }
};
