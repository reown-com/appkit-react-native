import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  Avatar,
  Button,
  DoubleImageLoader,
  FlexView,
  IconLink,
  Text
} from '@reown/appkit-ui-react-native';
import {
  ConnectionsController,
  EventsController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { useAppKit } from '../../AppKitContext';
import styles from './styles';

export function ConnectingSiweView() {
  const { disconnect } = useAppKit();
  const { metadata } = useSnapshot(OptionsController.state);
  const { activeAddress, identity, walletInfo } = useSnapshot(ConnectionsController.state);
  const [isSigning, setIsSigning] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const dappName = metadata?.name || 'Dapp';
  const dappIcon = metadata?.icons[0] || '';
  const walletIcon = walletInfo?.icon;
  const isSmartAccount = ConnectionsController.state.accountType === 'smartAccount';
  const network = ConnectionsController.state.activeNetwork?.caipNetworkId || '';

  const onSign = async () => {
    setIsSigning(true);
    EventsController.sendEvent({
      event: 'CLICK_SIGN_SIWE_MESSAGE',
      type: 'track',
      properties: { network, isSmartAccount }
    });
    try {
      const session = await SIWEController.signIn();

      EventsController.sendEvent({
        event: 'SIWE_AUTH_SUCCESS',
        type: 'track',
        properties: { network, isSmartAccount }
      });

      return session;
    } catch (error) {
      SnackController.showError('Signature declined');

      SIWEController.setStatus('error');

      return EventsController.sendEvent({
        event: 'SIWE_AUTH_ERROR',
        type: 'track',
        properties: { network, isSmartAccount }
      });
    } finally {
      setIsSigning(false);
    }
  };

  const onCancel = async () => {
    if (ConnectionsController.state.activeAddress) {
      setIsDisconnecting(true);
      await disconnect();
      setIsDisconnecting(false);
    } else {
      RouterController.push('Connect');
    }
    EventsController.sendEvent({
      event: 'CLICK_CANCEL_SIWE',
      type: 'track',
      properties: { network, isSmartAccount }
    });
  };

  return (
    <FlexView padding={['2xl', 's', '3xl', 's']}>
      <IconLink
        icon="close"
        size="md"
        onPress={onCancel}
        testID="header-close"
        style={styles.closeButton}
      />
      <Text variant="paragraph-600" numberOfLines={1} center>
        Sign in
      </Text>
      <DoubleImageLoader
        style={styles.logoContainer}
        leftImage={dappIcon}
        rightImage={walletIcon}
        renderRightPlaceholder={() => (
          <Avatar imageSrc={identity?.avatar} address={activeAddress} size={60} borderWidth={0} />
        )}
        rightItemStyle={!walletIcon && styles.walletAvatar}
      />
      <Text center variant="medium-600" color="fg-100" style={styles.title}>
        {dappName} needs to connect to your wallet
      </Text>
      <Text center variant="small-400" color="fg-200" style={styles.subtitle}>
        Sign this message to prove you own this wallet and proceed. Cancelling will disconnect you
      </Text>
      <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', '0', '0']}>
        <Button variant="shade" onPress={onCancel} style={styles.button} loading={isDisconnecting}>
          Cancel
        </Button>
        <Button
          variant="fill"
          loading={isSigning}
          disabled={isDisconnecting}
          onPress={onSign}
          style={styles.button}
        >
          Sign
        </Button>
      </FlexView>
    </FlexView>
  );
}
