import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  ConnectionsController,
  CoreHelperUtil,
  RouterController,
  SendController
} from '@reown/appkit-core-react-native';
import { Button, FlexView, IconBox, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { SendInputToken } from '../../partials/w3m-send-input-token';
import { useKeyboard } from '../../hooks/useKeyboard';
import { SendInputAddress } from '../../partials/w3m-send-input-address';
import styles from './styles';

export function WalletSendView() {
  const { padding, maxHeight } = useCustomDimensions();
  const { keyboardShown } = useKeyboard();
  const [isBalanceLoading, setBalanceLoading] = useState(false);
  const { token, sendTokenAmount, receiverAddress, receiverProfileName, loading } = useSnapshot(
    SendController.state
  );

  const onSendPress = () => {
    RouterController.push('WalletSendPreview');
  };

  const getActionText = () => {
    if (!SendController.state.token) {
      return 'Select token';
    }

    if (
      SendController.state.sendTokenAmount &&
      SendController.state.token?.quantity &&
      SendController.state.sendTokenAmount > Number(SendController.state.token.quantity.numeric)
    ) {
      return 'Insufficient funds';
    }

    if (!SendController.state.sendTokenAmount) {
      return 'Add amount';
    }

    if (SendController.state.sendTokenAmount && SendController.state.token?.price) {
      const value = SendController.state.sendTokenAmount * SendController.state.token.price;
      if (!value) {
        return 'Incorrect value';
      }
    }

    if (
      SendController.state.receiverAddress &&
      !CoreHelperUtil.isAddress(
        SendController.state.receiverAddress,
        ConnectionsController.state.activeNamespace
      )
    ) {
      return 'Invalid address';
    }

    if (!SendController.state.receiverAddress) {
      return 'Add address';
    }

    return 'Preview send';
  };

  useEffect(() => {
    async function fetchBalance() {
      setBalanceLoading(true);
      await ConnectionsController.fetchBalance();
      setBalanceLoading(false);
    }

    fetchBalance();
  }, []);

  const actionText = getActionText();

  return (
    <ScrollView
      style={[{ paddingHorizontal: padding }, keyboardShown && { height: maxHeight }]}
      bounces={false}
      keyboardShouldPersistTaps="always"
    >
      <FlexView padding="l" alignItems="center" justifyContent="center">
        <SendInputToken
          token={token}
          sendTokenAmount={sendTokenAmount}
          style={styles.tokenInput}
          onTokenPress={() => RouterController.push('WalletSendSelectToken')}
          loading={isBalanceLoading}
        />
        <FlexView alignItems="center" justifyContent="center" style={styles.addressContainer}>
          <SendInputAddress value={receiverProfileName || receiverAddress} />
          <IconBox
            icon="arrowBottom"
            size="lg"
            iconColor="fg-275"
            background
            backgroundColor="bg-175"
            border
            borderColor="bg-100"
            borderSize={10}
            style={styles.arrowIcon}
          />
        </FlexView>
        <Button
          style={styles.sendButton}
          onPress={onSendPress}
          disabled={!actionText.includes('Preview send')}
          loading={loading || isBalanceLoading}
        >
          {actionText}
        </Button>
      </FlexView>
    </ScrollView>
  );
}
