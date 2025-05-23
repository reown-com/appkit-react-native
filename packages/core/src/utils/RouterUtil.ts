import { RouterController, type RouterControllerState } from '../controllers/RouterController';
import { ModalController } from '../controllers/ModalController';

export const RouterUtil = {
  navigateAfterNetworkSwitch(excludeViews: RouterControllerState['view'][] = []) {
    if (excludeViews.includes(RouterController.state.view)) {
      return;
    }

    const { history } = RouterController.state;

    // Find the last occurrence of 'Networks' or 'UnsupportedChain'
    let lastNetworkViewIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === 'Networks' || history[i] === 'UnsupportedChain') {
        lastNetworkViewIndex = i;
        break;
      }
    }

    // Case 1: Navigated from a network selection view deeper in the app
    if (lastNetworkViewIndex > 0) {
      // Go to the view right before the network selection
      RouterController.goBackToIndex(lastNetworkViewIndex - 1);
    } else {
      ModalController.close();
    }
  }
};
