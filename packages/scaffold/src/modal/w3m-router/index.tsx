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
import { WhatIsNetworkView } from '../../views/w3m-what-is-a-network-view';
import { NetworkSwitchView } from '../../views/w3m-network-switch-view';
import { UiUtil } from '../../utils/UiUtil';

export function Web3Router() {
  const { view } = useSnapshot(RouterController.state);

  useLayoutEffect(() => {
    UiUtil.createViewTransition();
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
      case 'WhatIsANetwork':
        return WhatIsNetworkView;
      case 'GetWallet':
        return GetWalletView;
      case 'Networks':
        return NetworksView;
      case 'SwitchNetwork':
        return NetworkSwitchView;
      case 'Account':
        return AccountView;
      default:
        return ConnectView;
    }
  }, [view]);

  return <ViewComponent />;
}
