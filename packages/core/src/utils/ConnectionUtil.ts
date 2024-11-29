import { AccountController } from '../controllers/AccountController';
import { ConnectionController } from '../controllers/ConnectionController';
import { EventsController } from '../controllers/EventsController';
import { ModalController } from '../controllers/ModalController';
import { RouterController } from '../controllers/RouterController';
import { TransactionsController } from '../controllers/TransactionsController';

export const ConnectionUtil = {
  async disconnect() {
    try {
      await ConnectionController.disconnect();
      ModalController.close();
      AccountController.setIsConnected(false);
      RouterController.reset('Connect');
      TransactionsController.resetTransactions();
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      });
      throw new Error('ERROR PA');
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
    }
  }
};
