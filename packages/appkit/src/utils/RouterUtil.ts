import {
  EventsController,
  OnRampController,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-core-react-native';

export const RouterUtil = {
  // The user is on the unsupported network screen, or switching network from it
  isUnsupportedChainView() {
    const { view, history } = RouterController.state;

    return (
      view === 'UnsupportedChain' ||
      (view === 'SwitchNetwork' && history.includes('UnsupportedChain'))
    );
  },
  checkBack() {
    this.checkSwapBack();
    this.checkSendBack();
    this.checkOnRampBack();
    this.checkSocialLoginBack();
    this.checkOnRampBackLoading();
  },
  checkOnRampBackLoading() {
    if (
      RouterController.state.view === 'OnRampLoading' &&
      EventsController.state.data.event === 'BUY_SUBMITTED'
    ) {
      // Send event only if the onramp url was already created
      EventsController.sendEvent({ type: 'track', event: 'BUY_CANCEL' });
    }
  },
  checkSocialLoginBack() {
    if (RouterController.state.view === 'ConnectingSocial') {
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_CANCELED',
        properties: { provider: RouterController.state.data?.socialProvider! }
      });
    }
  },
  checkSwapBack() {
    if (RouterController.state.view === 'Swap') {
      SwapController.clearTokens();
    }
  },
  checkSendBack() {
    if (RouterController.state.view === 'WalletSend') {
      SendController.resetState();
    }
  },
  checkOnRampBack() {
    if (RouterController.state.view === 'OnRamp') {
      OnRampController.resetState();
    }
  }
};
