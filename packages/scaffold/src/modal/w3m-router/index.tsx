import { useLayoutEffect, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { RouterController } from '@reown/appkit-core-react-native';
import { ConnectingSiweView } from '@reown/appkit-siwe-react-native';

import { ConnectView } from '../../views/w3m-connect-view';
import { AllWalletsView } from '../../views/w3m-all-wallets-view';
import { ConnectingView } from '../../views/w3m-connecting-view';
import { WhatIsAWalletView } from '../../views/w3m-what-is-a-wallet-view';
import { GetWalletView } from '../../views/w3m-get-wallet-view';
import { AccountDefaultView } from '../../views/w3m-account-default-view';
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
import { AccountView } from '../../views/w3m-account-view';
import { WalletReceiveView } from '../../views/w3m-wallet-receive-view';
import { WalletCompatibleNetworks } from '../../views/w3m-wallet-compatible-networks-view';
import { TransactionsView } from '../../views/w3m-transactions-view';
import { WalletSendView } from '../../views/w3m-wallet-send-view';

export function AppKitRouter() {
  const { view } = useSnapshot(RouterController.state);

  useLayoutEffect(() => {
    UiUtil.createViewTransition();
  }, [view]);

  const ViewComponent = useMemo(() => {
    switch (view) {
      case 'Account':
        return AccountView;
      case 'AccountDefault':
        return AccountDefaultView;
      case 'AllWallets':
        return AllWalletsView;
      case 'Connect':
        return ConnectView;
      case 'ConnectingExternal':
        return ConnectingExternalView;
      case 'ConnectingSiwe':
        return ConnectingSiweView;
      case 'ConnectingWalletConnect':
        return ConnectingView;
      case 'EmailVerifyDevice':
        return EmailVerifyDeviceView;
      case 'EmailVerifyOtp':
        return EmailVerifyOtpView;
      case 'GetWallet':
        return GetWalletView;
      case 'Networks':
        return NetworksView;
      case 'SwitchNetwork':
        return NetworkSwitchView;
      case 'Transactions':
        return TransactionsView;
      case 'UpdateEmailPrimaryOtp':
        return UpdateEmailPrimaryOtpView;
      case 'UpdateEmailSecondaryOtp':
        return UpdateEmailSecondaryOtpView;
      case 'UpdateEmailWallet':
        return UpdateEmailWalletView;
      case 'UpgradeEmailWallet':
        return UpgradeEmailWalletView;
      case 'WalletCompatibleNetworks':
        return WalletCompatibleNetworks;
      case 'WalletReceive':
        return WalletReceiveView;
      case 'WalletSend':
        return WalletSendView;
      case 'WhatIsANetwork':
        return WhatIsNetworkView;
      case 'WhatIsAWallet':
        return WhatIsAWalletView;
      default:
        return ConnectView;
    }
  }, [view]);

  return <ViewComponent />;
}
