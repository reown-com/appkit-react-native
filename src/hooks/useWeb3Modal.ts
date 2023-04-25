import { useSnapshot } from 'valtio';

import { ModalCtrl } from '../controllers/ModalCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';

export function useWeb3Modal() {
  const modalState = useSnapshot(ModalCtrl.state);

  return {
    isOpen: modalState.open,
    open: ModalCtrl.open,
    close: ModalCtrl.close,
    provider: ClientCtrl.state.provider,
  };
}
