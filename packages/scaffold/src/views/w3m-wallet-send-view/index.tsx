import { useCallback, useEffect } from 'react';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSnapshot } from 'valtio';
import {
  AccountController,
  CoreHelperUtil,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-core-react-native';
import { Button, FlexView, IconBox, LoadingSpinner, Text } from '@reown/appkit-ui-react-native';
import { InputToken } from '../../partials/w3m-input-token/intex';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

import { InputAddress } from '../../partials/w3m-input-address';
import styles from './styles';

export function WalletSendView() {
  const { padding } = useCustomDimensions();
  const { token, sendTokenAmount, receiverAddress, receiverProfileName, loading, gasPrice } =
    useSnapshot(SendController.state);
  const { tokenBalance } = useSnapshot(AccountController.state);

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

  return (
    <BottomSheetScrollView
      style={{ paddingHorizontal: padding }}
      bounces={false}
      keyboardShouldPersistTaps="always"
    >
      <FlexView padding="l" alignItems="center" justifyContent="center">
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
            <Text variant="paragraph-600" color="inverse-100">
              {getActionText()}
            </Text>
          )}
        </Button>
      </FlexView>
    </BottomSheetScrollView>
  );
}
