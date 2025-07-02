import { useSnapshot } from 'valtio';
import { useLayoutEffect, useMemo } from 'react';
import { RouterController } from '@reown/appkit-core-react-native';

import { AccountDefaultView } from '../../views/w3m-account-default-view';
import { AccountView } from '../../views/w3m-account-view';
import { AllWalletsView } from '../../views/w3m-all-wallets-view';
import { ConnectView } from '../../views/w3m-connect-view';
import { ConnectSocialsView } from '../../views/w3m-connect-socials-view';
import { ConnectingView } from '../../views/w3m-connecting-view';
import { ConnectingExternalView } from '../../views/w3m-connecting-external-view';
import { ConnectingSocialView } from '../../views/w3m-connecting-social-view';
import { ConnectingSiweView } from '../../views/w3m-connecting-siwe-view';
import { GetWalletView } from '../../views/w3m-get-wallet-view';
import { NetworksView } from '../../views/w3m-networks-view';
import { NetworkSwitchView } from '../../views/w3m-network-switch-view';
import { OnRampLoadingView } from '../../views/w3m-onramp-loading-view';
import { OnRampView } from '../../views/w3m-onramp-view';
import { OnRampCheckoutView } from '../../views/w3m-onramp-checkout-view';
import { OnRampSettingsView } from '../../views/w3m-onramp-settings-view';
import { OnRampTransactionView } from '../../views/w3m-onramp-transaction-view';
import { SwapView } from '../../views/w3m-swap-view';
import { SwapPreviewView } from '../../views/w3m-swap-preview-view';
import { SwapSelectTokenView } from '../../views/w3m-swap-select-token-view';
import { TransactionsView } from '../../views/w3m-transactions-view';
import { UnsupportedChainView } from '../../views/w3m-unsupported-chain-view';
import { UpdateEmailWalletView } from '../../views/w3m-update-email-wallet-view';
import { UpdateEmailPrimaryOtpView } from '../../views/w3m-update-email-primary-otp-view';
import { UpdateEmailSecondaryOtpView } from '../../views/w3m-update-email-secondary-otp-view';
import { UpgradeEmailWalletView } from '../../views/w3m-upgrade-email-wallet-view';
import { WalletCompatibleNetworks } from '../../views/w3m-wallet-compatible-networks-view';
import { WalletReceiveView } from '../../views/w3m-wallet-receive-view';
import { WalletSendView } from '../../views/w3m-wallet-send-view';
import { WalletSendPreviewView } from '../../views/w3m-wallet-send-preview-view';
import { WalletSendSelectTokenView } from '../../views/w3m-wallet-send-select-token-view';
import { WhatIsANetworkView } from '../../views/w3m-what-is-a-network-view';
import { WhatIsAWalletView } from '../../views/w3m-what-is-a-wallet-view';
import { UiUtil } from '../../utils/UiUtil';

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
      case 'ConnectSocials':
        return ConnectSocialsView;
      case 'ConnectingExternal':
        return ConnectingExternalView;
      case 'ConnectingSiwe':
        return ConnectingSiweView;
      case 'ConnectingSocial':
        return ConnectingSocialView;
      case 'ConnectingWalletConnect':
        return ConnectingView;
      case 'GetWallet':
        return GetWalletView;
      case 'Networks':
        return NetworksView;
      case 'OnRamp':
        return OnRampView;
      case 'OnRampCheckout':
        return OnRampCheckoutView;
      case 'OnRampSettings':
        return OnRampSettingsView;
      case 'OnRampLoading':
        return OnRampLoadingView;
      case 'SwitchNetwork':
        return NetworkSwitchView;
      case 'OnRampTransaction':
        return OnRampTransactionView;
      case 'Swap':
        return SwapView;
      case 'SwapPreview':
        return SwapPreviewView;
      case 'SwapSelectToken':
        return SwapSelectTokenView;
      case 'Transactions':
        return TransactionsView;
      case 'UnsupportedChain':
        return UnsupportedChainView;
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
      case 'WalletSendPreview':
        return WalletSendPreviewView;
      case 'WalletSendSelectToken':
        return WalletSendSelectTokenView;
      case 'WhatIsANetwork':
        return WhatIsANetworkView;
      case 'WhatIsAWallet':
        return WhatIsAWalletView;
      default:
        return ConnectView;
    }
  }, [view]);

  return <ViewComponent />;
}
