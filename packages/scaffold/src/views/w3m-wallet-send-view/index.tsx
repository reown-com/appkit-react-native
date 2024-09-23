import { useCallback, useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  AccountController,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingSpinner,
  Spacing,
  Text
} from '@reown/appkit-ui-react-native';
import { InputToken } from '../../partials/w3m-input-token/intex';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { useKeyboard } from '../../hooks/useKeyboard';
import { InputAddress } from '../../partials/w3m-input-address';
import styles from './styles';

export function WalletSendView() {
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const { token, sendTokenAmount, receiverAddress, loading, gasPrice } = useSnapshot(
    SendController.state
  );
  const { tokenBalance } = useSnapshot(AccountController.state);

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const fetchNetworkPrice = useCallback(async () => {
    await SwapController.getNetworkTokenPrice();
    const gas = await SwapController.getInitialGasPrice();
    if (gas?.gasPrice && gas?.gasPriceInUSD) {
      SendController.setGasPrice(gas.gasPrice);
      SendController.setGasPriceInUsd(gas.gasPriceInUSD);
    }
  }, []);

  const onSendPress = () => {
    if (SendController.state.loading) return;
    // TODO: add validations
    RouterController.push('WalletSendPreview');
  };

  const getActionText = () => {
    if (
      SendController.state.token &&
      SendController.state.sendTokenAmount &&
      SendController.state.sendTokenAmount > Number(SendController.state.token.quantity.numeric)
    ) {
      return 'Insufficient balance';
    }

    if (!SendController.state.receiverAddress) {
      return 'Add address';
    }

    return 'Preview Send';
  };

  useEffect(() => {
    // TODO: check this
    SendController.setToken(tokenBalance?.[0]);
    fetchNetworkPrice();
  }, [tokenBalance, fetchNetworkPrice]);

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
          gasPrice={gasPrice}
          style={styles.tokenInput}
        />
        <FlexView alignItems="center" justifyContent="center" style={styles.addressContainer}>
          <InputAddress value={receiverAddress} />
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
