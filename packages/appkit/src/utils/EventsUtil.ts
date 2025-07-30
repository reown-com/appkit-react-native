import { EventsController, RouterController } from '@reown/appkit-core-react-native';

export const EventsUtil = {
  checkOnRampCanceled() {
    if (
      RouterController.state.view === 'OnRampLoading' &&
      EventsController.state.data.event === 'BUY_SUBMITTED'
    ) {
      // Send event only if the onramp url was already created
      EventsController.sendEvent({ type: 'track', event: 'BUY_CANCEL' });
    }
  },
  checkSocialLoginCanceled() {
    if (RouterController.state.view === 'ConnectingSocial') {
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_CANCELED',
        properties: { provider: RouterController.state.data?.socialProvider! }
      });
    }
  }
};
