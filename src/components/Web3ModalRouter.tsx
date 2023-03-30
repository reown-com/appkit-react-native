import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import QRCodeView from '../views/QRCodeView';
import ViewAllExplorer from '../views/ViewAllExplorer';
import { RouterCtrl } from '../controllers/RouterCtrl';
import InitialExplorer from '../views/InitialExplorer';
import { Account } from '../views/Account';

export function Web3ModalRouter() {
  const [activeView, setActiveView] = React.useState(RouterCtrl.state.view);

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
        return View; // TODO: Add a default view here
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

  return <ViewComponent />;
}
