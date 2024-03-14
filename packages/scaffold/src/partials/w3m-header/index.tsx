import { useSnapshot } from 'valtio';
import { RouterController, ModalController, EventsController } from '@web3modal/core-react-native';
import { IconLink, Text, FlexView, Separator } from '@web3modal/ui-react-native';

export function Header() {
  const { view, history } = useSnapshot(RouterController.state);

  const onHelpPress = () => {
    RouterController.push('WhatIsAWallet');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' });
  };

  const headings = () => {
    const connectorName = RouterController.state.data?.connector?.name;
    const walletName = RouterController.state.data?.wallet?.name;
    const networkName = RouterController.state.data?.network?.name;

    return {
      Connect: 'Connect wallet',
      Account: undefined,
      ConnectingWalletConnect: walletName ?? 'WalletConnect',
      ConnectingExternal: connectorName ?? 'Connect Wallet',
      Networks: 'Select network',
      SwitchNetwork: networkName ?? 'Switch network',
      AllWallets: 'All wallets',
      WhatIsANetwork: 'What is a network?',
      WhatIsAWallet: 'What is a wallet?',
      GetWallet: 'Get a wallet',
      EmailVerifyDevice: 'Register Device',
      EmailVerifyOtp: 'Confirm email'
    };
  };

  const header = headings()[view];

  const dynamicButtonTemplate = () => {
    const showBack = history.length > 1;

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

  return (
    <>
      <FlexView
        justifyContent="space-between"
        flexDirection="row"
        alignItems="center"
        padding={['l', 'xl', 'l', 'xl']}
      >
        {dynamicButtonTemplate()}
        <Text variant="paragraph-600" numberOfLines={1}>
          {header}
        </Text>
        <IconLink icon="close" size="md" onPress={ModalController.close} testID="button-close" />
      </FlexView>
      <Separator />
    </>
  );
}
