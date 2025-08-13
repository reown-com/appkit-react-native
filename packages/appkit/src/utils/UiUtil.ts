import { RouterController } from '@reown/appkit-core-react-native';

// Global animation instance to coordinate transitions
let currentRouteTransition: ((direction: 'forward' | 'backward' | 'none') => Promise<void>) | null =
  null;

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  setRouteTransition: (
    transitionFn: (direction: 'forward' | 'backward' | 'none') => Promise<void>
  ) => {
    currentRouteTransition = transitionFn;
  },

  createViewTransition: async () => {
    if (currentRouteTransition) {
      const { navigationDirection } = RouterController.state;
      await currentRouteTransition(navigationDirection);
      // After the transition completes, ensure direction is reset to 'none'
      if (RouterController.state.navigationDirection !== 'none') {
        RouterController.state.navigationDirection = 'none';
      }
    }
  }
};
