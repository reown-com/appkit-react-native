import { RouterController, type RouterControllerState } from '../controllers/RouterController';
import { ModalController } from '../controllers/ModalController';

export const RouterUtil = {
  navigateAfterNetworkSwitch(excludeViews: RouterControllerState['view'][] = []) {
    if (excludeViews.includes(RouterController.state.view)) {
      return;
    }

    const { history } = RouterController.state;
    const networkSelectIndex = history.findIndex(name => name === 'Networks');
    if (networkSelectIndex >= 1) {
      RouterController.goBackToIndex(networkSelectIndex - 1);
    } else {
      ModalController.close();
    }
  }
};
