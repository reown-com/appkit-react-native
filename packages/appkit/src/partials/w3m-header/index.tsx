import { useSnapshot } from 'valtio';
import {
  RouterController,
  EventsController,
  type RouterControllerState
} from '@reown/appkit-core-react-native';
import { IconLink, Text, FlexView } from '@reown/appkit-ui-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';

import styles from './styles';
import { useInternalAppKit } from '../../AppKitContext';

export function Header() {
  const { close, back } = useInternalAppKit();
  const { data, view } = useSnapshot(RouterController.state);
  const onHelpPress = () => {
    RouterController.push('WhatIsAWallet', undefined, 'backward');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' });
  };

  const headings = (_data: RouterControllerState['data'], _view: RouterControllerState['view']) => {
    const walletName = _data?.wallet?.name;
    const networkName = _data?.network?.name;
    const socialName = _data?.socialProvider
      ? StringUtil.capitalize(_data?.socialProvider)
      : undefined;

    return {
      Account: undefined,
      AccountDefault: undefined,
      AllWallets: 'All wallets',
      Connect: 'Connect wallet',
      ConnectSocials: 'All socials',
      ConnectingExternal: walletName ?? 'Connect wallet',
      ConnectingSiwe: undefined,
      ConnectingSocial: socialName ?? 'Connecting Social',
      ConnectingWalletConnect: walletName ?? 'WalletConnect',
      GetWallet: 'Get a wallet',
      Networks: 'Select network',
      OnRamp: undefined,
      OnRampCheckout: 'Checkout',
      OnRampSettings: 'Preferences',
      OnRampLoading: undefined,
      OnRampTransaction: ' ',
      SwitchNetwork: networkName ?? 'Switch network',
      Swap: 'Swap',
      SwapPreview: 'Review swap',
      Transactions: 'Activity',
      UnsupportedChain: 'Switch network',
      UpgradeEmailWallet: 'Upgrade wallet',
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
  const noBackViews = ['UnsupportedChain'];
  const showClose = !noCloseViews.includes(view);
  const header = headings(data, view);

  const handleGoBack = () => {
    back();
  };

  const handleClose = () => {
    close();
  };

  const dynamicButtonTemplate = () => {
    const showBack =
      RouterController.state.history.length > 1 &&
      !noBackViews.includes(RouterController.state.view);
    const showHelp = RouterController.state.view === 'Connect';

    if (showHelp) {
      return <IconLink icon="helpCircle" size="md" onPress={onHelpPress} testID="help-button" />;
    }

    if (showBack) {
      return <IconLink icon="chevronLeft" size="md" onPress={handleGoBack} testID="button-back" />;
    }

    return <FlexView style={styles.iconPlaceholder} />;
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
      <Text variant="paragraph-600" numberOfLines={1} testID="header-text">
        {header}
      </Text>
      {showClose ? (
        <IconLink icon="close" size="md" onPress={handleClose} testID="header-close" />
      ) : (
        <FlexView style={styles.iconPlaceholder} />
      )}
    </FlexView>
  );
}
