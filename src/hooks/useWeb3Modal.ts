import { useEffect, useState } from 'react';
import { ModalCtrl } from '../controllers/ModalCtrl';

export function useWeb3Modal() {
  const [modal, setModal] = useState(ModalCtrl.state);

  useEffect(() => {
    const unsubscribe = ModalCtrl.subscribe((newModal) =>
      setModal({ ...newModal })
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOpen: modal.open,
    open: ModalCtrl.open,
    close: ModalCtrl.close,
  };
}
