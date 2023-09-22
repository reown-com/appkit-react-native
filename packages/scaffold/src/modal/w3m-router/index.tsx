import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { RouterController } from '@web3modal/core-react-native';

import { View } from 'react-native';
import { ConnectView } from '../../views/w3m-connect-view';
import { AllWalletsView } from '../../views/w3m-all-wallets-view';
import { ConnectingView } from '../../views/w3m-connecting-view';
import { WhatIsAWalletView } from '../../views/w3m-what-is-a-wallet-view';

interface Props {
  // onCopyClipboard?: (value: string) => void;
}

export function Web3Router(props: Props) {
  const routerState = useSnapshot(RouterController.state);

  const ViewComponent = useMemo(() => {
    switch (routerState.view) {
      case 'Connect':
        return ConnectView;
      case 'AllWallets':
        return AllWalletsView;
      case 'ConnectingWalletConnect':
        return ConnectingView;
      case 'WhatIsAWallet':
        return WhatIsAWalletView;
      case 'Account':
        return View;
      default:
        return View;
    }
  }, [routerState.view]);

  return <ViewComponent {...props} />;
}
