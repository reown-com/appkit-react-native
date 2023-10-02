import { useLayoutEffect, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { RouterController } from '@web3modal/core-react-native';

import { ConnectView } from '../../views/w3m-connect-view';
import { AllWalletsView } from '../../views/w3m-all-wallets-view';
import { ConnectingView } from '../../views/w3m-connecting-view';
import { WhatIsAWalletView } from '../../views/w3m-what-is-a-wallet-view';
import { GetWalletView } from '../../views/w3m-get-wallet-view';
import { AccountView } from '../../views/w3m-account-view';
import { NetworksView } from '../../views/w3m-networks-view';
import { LayoutAnimation } from 'react-native';

interface Props {
  // onCopyClipboard?: (value: string) => void;
}

export function Web3Router(props: Props) {
  const { view } = useSnapshot(RouterController.state);

  useLayoutEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  }, [view]);

  const ViewComponent = useMemo(() => {
    switch (view) {
      case 'Connect':
        return ConnectView;
      case 'AllWallets':
        return AllWalletsView;
      case 'ConnectingWalletConnect':
        return ConnectingView;
      case 'WhatIsAWallet':
        return WhatIsAWalletView;
      case 'GetWallet':
        return GetWalletView;
      case 'Networks':
        return NetworksView;
      case 'Account':
        return AccountView;
      default:
        return ConnectView;
    }
  }, [view]);

  return <ViewComponent {...props} />;
}
