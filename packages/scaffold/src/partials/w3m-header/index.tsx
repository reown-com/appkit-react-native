import {
  RouterController,
  ModalController,
  EventsController
} from '@reown/appkit-core-react-native';
import { IconLink, Text, FlexView } from '@reown/appkit-ui-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';

export function Header() {
  const onHelpPress = () => {
    RouterController.push('WhatIsAWallet');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' });
  };

  const headings = () => {
    const { data } = RouterController.state;
    const connectorName = data?.connector?.name;
    const walletName = data?.wallet?.name;
    const networkName = data?.network?.name;
    const socialName = undefined;

    return {
      Account: undefined,
      AccountDefault: undefined,
      AllWallets: 'All wallets',
      Connect: 'Connect wallet',
      ConnectingExternal: connectorName ?? 'Connect wallet',
      ConnectingSiwe: 'Sign In',
      ConnectingSocial: socialName ?? 'Connecting Social',
      ConnectingWalletConnect: walletName ?? 'WalletConnect',
      EmailVerifyDevice: ' ',
      EmailVerifyOtp: 'Confirm email',
      GetWallet: 'Get a wallet',
      Networks: 'Select network',
      SwitchNetwork: networkName ?? 'Switch network',
      Transactions: 'Activity',
      UpdateEmailPrimaryOtp: 'Confirm current email',
      UpdateEmailSecondaryOtp: 'Confirm new email',
      UpdateEmailWallet: 'Edit email',
      UpgradeEmailWallet: 'Upgrade wallet',
      WalletCompatibleNetworks: 'Compatible networks',
      WalletReceive: 'Receive',
      WalletSend: 'Send',
      WalletSendPreview: 'Review send',
      WalletSendSelectToken: 'Select token',
      WhatIsANetwork: 'What is a network?',
      WhatIsAWallet: 'What is a wallet?'
    };
  };

  const header = headings()[RouterController.state.view];

  const dynamicButtonTemplate = () => {
    const hideBackViews = ['ConnectingSiwe'];
    const showBack =
      RouterController.state.history.length > 1 &&
      !hideBackViews.includes(RouterController.state.view);

    return showBack ? (
      <IconLink
        icon="chevronLeft"
        size="md"
        onPress={RouterController.goBack}
        testID="button-back"
      />
    ) : (
      <IconLink icon="helpCircle" size="md" onPress={onHelpPress} testID="button-help" />
    );
  };

  if (!header) return null;

  const bottomPadding = header === ' ' ? '0' : '4xs';

  return (
    <FlexView
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      padding={['l', 'xl', bottomPadding, 'xl']}
    >
      {dynamicButtonTemplate()}
      <Text variant="paragraph-600" numberOfLines={1}>
        {header}
      </Text>
      <IconLink icon="close" size="md" onPress={ModalController.close} testID="button-close" />
    </FlexView>
  );
}
