import { useSnapshot } from 'valtio';
import {
  RouterController,
  ModalController,
  EventsController,
  type RouterControllerState,
  ConnectionController,
  ConnectorController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import { IconLink, Text, FlexView } from '@reown/appkit-ui-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';

import { Snackbar } from '../../partials/w3m-snackbar';
import styles from './styles';

export function Header() {
  const { data, view } = useSnapshot(RouterController.state);
  const onHelpPress = () => {
    RouterController.push('WhatIsAWallet');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' });
  };

  const headings = (_data: RouterControllerState['data'], _view: RouterControllerState['view']) => {
    const connectorName = _data?.connector?.name;
    const walletName = _data?.wallet?.name;
    const networkName = _data?.network?.name;
    const socialName = ConnectionController.state.selectedSocialProvider
      ? StringUtil.capitalize(ConnectionController.state.selectedSocialProvider)
      : undefined;

    return {
      Account: undefined,
      AccountDefault: undefined,
      AllWallets: 'All wallets',
      Connect: 'Connect wallet',
      ConnectSocials: 'All socials',
      ConnectingExternal: connectorName ?? 'Connect wallet',
      ConnectingSiwe: undefined,
      ConnectingFarcaster: socialName ?? 'Connecting Social',
      ConnectingSocial: socialName ?? 'Connecting Social',
      ConnectingWalletConnect: walletName ?? 'WalletConnect',
      Create: 'Create wallet',
      EmailVerifyDevice: ' ',
      EmailVerifyOtp: 'Confirm email',
      GetWallet: 'Get a wallet',
      Networks: 'Select network',
      OnRamp: undefined,
      OnRampCheckout: 'Checkout',
      OnRampSettings: 'Preferences',
      OnRampLoading: undefined,
      SwitchNetwork: networkName ?? 'Switch network',
      Swap: 'Swap',
      SwapSelectToken: 'Select token',
      SwapPreview: 'Review swap',
      Transactions: 'Activity',
      UnsupportedChain: 'Switch network',
      UpdateEmailPrimaryOtp: 'Confirm current email',
      UpdateEmailSecondaryOtp: 'Confirm new email',
      UpdateEmailWallet: 'Edit email',
      UpgradeEmailWallet: 'Upgrade wallet',
      UpgradeToSmartAccount: undefined,
      WalletCompatibleNetworks: 'Compatible networks',
      WalletReceive: 'Receive',
      WalletSend: 'Send',
      WalletSendPreview: 'Review send',
      WalletSendSelectToken: 'Select token',
      WhatIsANetwork: 'What is a network?',
      WhatIsAWallet: 'What is a wallet?'
    }[_view];
  };

  const noCloseViews = ['OnRampSettings'];
  const showClose = !noCloseViews.includes(view);
  const header = headings(data, view);

  const checkSocial = () => {
    if (
      RouterController.state.view === 'ConnectingFarcaster' ||
      RouterController.state.view === 'ConnectingSocial'
    ) {
      const socialProvider = ConnectionController.state.selectedSocialProvider;
      const authProvider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;

      if (authProvider && socialProvider === 'farcaster') {
        // TODO: remove this once Farcaster session refresh is implemented
        // @ts-expect-error
        authProvider.webviewRef?.current?.reload();
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_CANCELED',
        properties: { provider: ConnectionController.state.selectedSocialProvider! }
      });
    }
  };

  const handleGoBack = () => {
    checkSocial();
    RouterController.goBack();
  };

  const handleClose = () => {
    checkSocial();
    ModalController.close();
  };

  const dynamicButtonTemplate = () => {
    const noButtonViews = ['ConnectingSiwe'];

    if (noButtonViews.includes(RouterController.state.view)) {
      return <FlexView style={styles.iconPlaceholder} />;
    }

    const showBack = RouterController.state.history.length > 1;

    return showBack ? (
      <IconLink icon="chevronLeft" size="md" onPress={handleGoBack} testID="button-back" />
    ) : (
      <IconLink icon="helpCircle" size="md" onPress={onHelpPress} testID="help-button" />
    );
  };

  if (!header) return null;

  const bottomPadding = header === ' ' ? '0' : '4xs';

  return (
    <>
      <FlexView
        justifyContent="space-between"
        flexDirection="row"
        alignItems="center"
        padding={['l', 'xl', bottomPadding, 'xl']}
      >
        {dynamicButtonTemplate()}
        <Text variant="paragraph-600" numberOfLines={1} testID="header-text">
          {header}
        </Text>
        {showClose ? (
          <IconLink icon="close" size="md" onPress={handleClose} testID="header-close" />
        ) : (
          <FlexView style={styles.iconPlaceholder} />
        )}
      </FlexView>
      <Snackbar />
    </>
  );
}
