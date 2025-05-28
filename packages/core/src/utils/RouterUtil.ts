import { RouterController } from '../controllers/RouterController';
import { ModalController } from '../controllers/ModalController';

export const RouterUtil = {
  goBackOrCloseModal() {
    if (RouterController.state.history.length > 1) {
      RouterController.goBack();
    } else {
      ModalController.close();
    }
  }
};
