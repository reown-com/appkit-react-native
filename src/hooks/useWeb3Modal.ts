import { useEffect, useState } from 'react';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';

export function useWeb3Modal() {
  const [modal, setModal] = useState(ModalCtrl.state);
  const [initialized, setInitialized] = useState(ClientCtrl.state.initialized);

  useEffect(() => {
    const unsubscribeModal = ModalCtrl.subscribe((newModal) =>
      setModal({ ...newModal })
    );

    const unsubscribeClient = ClientCtrl.subscribe((newClient) =>
      setInitialized(newClient.initialized)
    );

    return () => {
      unsubscribeModal();
      unsubscribeClient();
    };
  }, []);

  return {
    isOpen: modal.open,
    open: ModalCtrl.open,
    close: ModalCtrl.close,
    provider: ClientCtrl.state.provider,
    initialized,
  };
}
