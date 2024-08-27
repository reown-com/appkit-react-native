import { useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import { AccountController, SendController } from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingSpinner,
  Spacing,
  Text
} from '@web3modal/ui-react-native';
import { InputToken } from '../../partials/w3m-input-token/intex';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { useKeyboard } from '../../hooks/useKeyboard';
import styles from './styles';

export function WalletSendView() {
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const { token, sendTokenAmount, receiverAddress, receiverProfileName, loading, gasPriceInUSD } =
    useSnapshot(SendController.state);
  const { tokenBalance } = useSnapshot(AccountController.state);

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const onSendPress = () => {
    if (loading) return;
  };

  const getActionText = () => {
    if (token && sendTokenAmount && sendTokenAmount > Number(token.quantity.numeric)) {
      return 'Insufficient balance';
    }

    return 'Send';
  };

  useEffect(() => {
    // TODO: remove this
    SendController.setToken(tokenBalance[0]);
  }, [tokenBalance]);

  return (
    <ScrollView
      style={{ paddingHorizontal: padding }}
      bounces={false}
      keyboardShouldPersistTaps="always"
    >
      <FlexView padding="l" alignItems="center" justifyContent="center" style={{ paddingBottom }}>
        <InputToken
          token={token}
          sendTokenAmount={sendTokenAmount}
          gasPriceInUSD={gasPriceInUSD}
          style={styles.tokenInput}
        />
        <FlexView alignItems="center" justifyContent="center" style={{ width: '100%' }}>
          <InputToken token={token} />
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
        <Button style={styles.sendButton} onPress={onSendPress}>
          {loading ? (
            <LoadingSpinner color="inverse-100" size="md" />
          ) : (
            <Text variant="paragraph-600" color="inverse-100">
              {getActionText()}
            </Text>
          )}
        </Button>
      </FlexView>
    </ScrollView>
  );
}
