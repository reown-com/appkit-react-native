import { useSnapshot } from 'valtio';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, FlexView, IconLink, Text } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ConnectionController,
  EventsController,
  ModalController,
  NetworkController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';

import { ConnectingSiwe } from '../../partials/w3m-connecting-siwe';
import { useState } from 'react';
import { SIWEController } from '../../../controller/SIWEController';
import styles from './styles';

export function ConnectingSiweView() {
  const { metadata } = useSnapshot(OptionsController.state);
  const [isSigning, setIsSigning] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const dappName = metadata?.name || 'Dapp';

  const onSign = async () => {
    setIsSigning(true);
    EventsController.sendEvent({
      event: 'CLICK_SIGN_SIWE_MESSAGE',
      type: 'track',
      properties: {
        network: NetworkController.state.caipNetwork?.id || '',
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
    try {
      const session = await SIWEController.signIn();

      EventsController.sendEvent({
        event: 'SIWE_AUTH_SUCCESS',
        type: 'track',
        properties: {
          network: NetworkController.state.caipNetwork?.id || '',
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });

      return session;
    } catch (error) {
      SnackController.showError('Signature declined');

      SIWEController.setStatus('error');

      return EventsController.sendEvent({
        event: 'SIWE_AUTH_ERROR',
        type: 'track',
        properties: {
          network: NetworkController.state.caipNetwork?.id || '',
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });
    } finally {
      setIsSigning(false);
    }
  };

  const onCancel = async () => {
    const { isConnected } = AccountController.state;
    if (isConnected) {
      setIsDisconnecting(true);
      await ConnectionController.disconnect();
      ModalController.close();
      setIsDisconnecting(false);
    } else {
      RouterController.push('Connect');
    }
    EventsController.sendEvent({
      event: 'CLICK_CANCEL_SIWE',
      type: 'track',
      properties: {
        network: NetworkController.state.caipNetwork?.id || '',
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
  };

  return (
    <BottomSheetView>
      <FlexView padding={['2xl', 's', '3xl', 's']}>
        <IconLink
          icon="close"
          size="md"
          onPress={onCancel}
          testID="button-close"
          style={styles.closeButton}
        />
        <Text variant="paragraph-600" numberOfLines={1} center>
          Sign in
        </Text>
        <ConnectingSiwe style={styles.logoContainer} />
        <Text center variant="medium-600" color="fg-100" style={styles.title}>
          {dappName} needs to connect to your wallet
        </Text>
        <Text center variant="small-400" color="fg-200" style={styles.subtitle}>
          Sign this message to prove you own this wallet and proceed. Cancelling will disconnect you
        </Text>
        <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', '0', '0']}>
          <Button
            variant="shade"
            onPress={onCancel}
            style={styles.button}
            loading={isDisconnecting}
          >
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
    </BottomSheetView>
  );
}
