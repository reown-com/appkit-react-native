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
import { ConnectingExternalView } from '../../views/w3m-connecting-external-view';
import { EmailVerifyOtpView } from '../../views/w3m-email-verify-otp-view';
import { EmailVerifyDeviceView } from '../../views/w3m-email-verify-device-view';
import { UpdateEmailWalletView } from '../../views/w3m-update-email-wallet-view';
import { UpdateEmailPrimaryOtpView } from '../../views/w3m-update-email-primary-otp-view';
import { UpdateEmailSecondaryOtpView } from '../../views/w3m-update-email-secondary-otp-view';
import { UpgradeEmailWalletView } from '../../views/w3m-upgrade-email-wallet-view';

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
      case 'ConnectingExternal':
        return ConnectingExternalView;
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
      case 'EmailVerifyDevice':
        return EmailVerifyDeviceView;
      case 'EmailVerifyOtp':
        return EmailVerifyOtpView;
      case 'UpdateEmailWallet':
        return UpdateEmailWalletView;
      case 'UpdateEmailPrimaryOtp':
        return UpdateEmailPrimaryOtpView;
      case 'UpdateEmailSecondaryOtp':
        return UpdateEmailSecondaryOtpView;
      case 'UpgradeEmailWallet':
        return UpgradeEmailWalletView;
      default:
        return ConnectView;
    }
  }, [view]);

  return <ViewComponent />;
}
