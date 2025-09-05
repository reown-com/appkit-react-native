import { StyleSheet } from 'react-native';
import { useAccount } from '@reown/appkit-react-native';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { useSignMessage, useSendTransaction, useEstimateGas } from 'wagmi';
import { Hex, parseEther } from 'viem';
import { SendTransactionData, SignMessageData } from 'wagmi/query';
import { ToastUtils } from '../utils/ToastUtils';

export function WagmiActionsView() {
  const { isConnected } = useAccount();

  const onSignSuccess = (data: SignMessageData) => {
    ToastUtils.showSuccessToast('Signature successful', data);
  };

  const onSignError = (error: Error) => {
    ToastUtils.showErrorToast('Signature failed', error.message);
  };

  const onSendSuccess = (data: SendTransactionData) => {
    ToastUtils.showSuccessToast('Transaction successful', data);
  };

  const onSendError = (error: Error) => {
    ToastUtils.showErrorToast('Transaction failed', error.message);
  };

  const { isPending, signMessage } = useSignMessage({
    mutation: {
      onSuccess: onSignSuccess,
      onError: onSignError
    }
  });
  const TX = {
    to: '0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689' as Hex, // Test wallet
    value: parseEther('0.001'),
    data: '0x' as Hex
  };

  const { data: gas, isError: isGasError } = useEstimateGas(TX);

  const { isPending: isSending, sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: onSendSuccess,
      onError: onSendError
    }
  });

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Wagmi Actions</Text>
      <Button
        disabled={isPending}
        testID="sign-message-button"
        onPress={() => signMessage({ message: 'Hello AppKit!' })}
      >
        Sign
      </Button>
      {isGasError ? <Text>Error estimating gas</Text> : null}
      <Button disabled={isSending} onPress={() => sendTransaction({ ...TX, gas })}>
        Send
      </Button>
      {isSending ? <Text>Check Wallet</Text> : null}
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 8
  }
});
