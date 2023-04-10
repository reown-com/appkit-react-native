import { useMemo } from 'react';
import { useSnapshot } from 'valtio';

import QRCodeView from '../views/QRCodeView';
import ViewAllExplorer from '../views/ViewAllExplorer';
import { RouterCtrl } from '../controllers/RouterCtrl';
import InitialExplorer from '../views/InitialExplorer';
import { Account } from '../views/Account';
import { Error } from '../views/Error';
import type { RouterProps } from '../types/routerTypes';

export function Web3ModalRouter(props: RouterProps) {
  const routerState = useSnapshot(RouterCtrl.state);

  const ViewComponent = useMemo(() => {
    switch (routerState.view) {
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
  }, [routerState.view]);

  return <ViewComponent {...props} />;
}
