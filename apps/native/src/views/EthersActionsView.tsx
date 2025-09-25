import { StyleSheet } from 'react-native';
import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useProvider } from '@reown/appkit-react-native';
import { hexlify, isHexString, toUtf8Bytes } from 'ethers';

import { ToastUtils } from '../utils/ToastUtils';

export function EthersActionsView() {
  const { address, chainId } = useAccount();
  const { provider } = useProvider();

  const onSignSuccess = (data: any) => {
    ToastUtils.showSuccessToast('Sign successful', data);
  };

  const onSignError = (error: Error) => {
    ToastUtils.showErrorToast('Sign failed', error.message);
  };

  const signMessage = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign failed', 'No provider found');

        return;
      }

      if (!address) {
        ToastUtils.showErrorToast('Sign failed', 'No address found');

        return;
      }

      const message = 'Hello from AppKit Ethers';
      const hexMessage = isHexString(message) ? message : hexlify(toUtf8Bytes(message));

      const signature = await provider.request(
        {
          method: 'personal_sign',
          params: [hexMessage, address]
        },`eip155:${chainId}`
      );

      onSignSuccess(signature);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error);
      onSignError(error as Error);
    }
  };

  return (
    <FlexView style={styles.container}>
      <Text variant="medium-600">EVM Actions</Text>
      <Button testID="sign-message-button" onPress={signMessage}>
        Sign
      </Button>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8
  }
});
