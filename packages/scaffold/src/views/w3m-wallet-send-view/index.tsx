import { useCallback, useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  AccountController,
  CoreHelperUtil,
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
  const { token, sendTokenAmount, receiverAddress, receiverProfileName, loading, gasPrice } =
    useSnapshot(SendController.state);
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
    RouterController.push('WalletSendPreview');
  };

  const getActionText = () => {
    if (!SendController.state.token) {
      return 'Select token';
    }

    if (
      SendController.state.sendTokenAmount &&
      SendController.state.token &&
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
      !CoreHelperUtil.isAddress(SendController.state.receiverAddress)
    ) {
      return 'Invalid address';
    }

    if (!SendController.state.receiverAddress) {
      return 'Add address';
    }

    return 'Preview send';
  };

  useEffect(() => {
    if (!token) {
      SendController.setToken(tokenBalance?.[0]);
    }
    fetchNetworkPrice();
  }, [token, tokenBalance, fetchNetworkPrice]);

  const actionText = getActionText();
  const disabled = actionText !== 'Preview send';

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
          gasPrice={Number(gasPrice)}
          style={styles.tokenInput}
          onTokenPress={() => RouterController.push('WalletSendSelectToken')}
        />
        <FlexView alignItems="center" justifyContent="center" style={styles.addressContainer}>
          <InputAddress value={receiverProfileName || receiverAddress} />
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
        >
          {loading ? (
            <LoadingSpinner color="inverse-100" size="md" />
          ) : (
            <Text variant="paragraph-600" color={disabled ? 'fg-250' : 'inverse-100'}>
              {getActionText()}
            </Text>
          )}
        </Button>
      </FlexView>
    </ScrollView>
  );
}
