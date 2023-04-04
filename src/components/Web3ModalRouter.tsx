import { useEffect, useMemo, useState } from 'react';

import QRCodeView from '../views/QRCodeView';
import ViewAllExplorer from '../views/ViewAllExplorer';
import { RouterCtrl } from '../controllers/RouterCtrl';
import InitialExplorer from '../views/InitialExplorer';
import { Account } from '../views/Account';
import { Error } from '../views/Error';
import type { RouterProps } from '../types/routerTypes';

export function Web3ModalRouter(props: RouterProps) {
  const [activeView, setActiveView] = useState(RouterCtrl.state.view);

  const ViewComponent = useMemo(() => {
    switch (activeView) {
      case 'ConnectWallet':
        return InitialExplorer;
      case 'WalletExplorer':
        return ViewAllExplorer;
      case 'Qrcode':
        return QRCodeView;
      case 'Account':
        return Account;
      default:
        return Error;
    }
  }, [activeView]);

  useEffect(() => {
    const unsubscribe = RouterCtrl.subscribe((state) => {
      setActiveView(state.view);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <ViewComponent {...props} />;
}
