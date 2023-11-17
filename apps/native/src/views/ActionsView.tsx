import { Button, Text } from '@web3modal/ui-react-native';
import { View } from 'react-native';
import { useSignMessage, useAccount, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

export function ActionsView() {
  const { isConnected } = useAccount();
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: 'Hello Web3Modal!'
  });

  const {
    data: sendData,
    isLoading: isSending,
    isSuccess: isSendSuccess,
    sendTransaction
  } = useSendTransaction({
    to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', //vitalik.etch
    value: parseEther('0.01'),
    data: '0x'
  });

  return isConnected ? (
    <View>
      <Text variant="large-600">Wagmi Actions</Text>
      <Button disabled={isLoading} onPress={() => signMessage()}>
        Sign
      </Button>
      {isSuccess && <Text>Signature: {data}</Text>}
      {isError && <Text>Error signing message</Text>}
      <Button disabled={isSending} onPress={() => sendTransaction()}>
        Send
      </Button>
      {isSending && <Text>Check Wallet</Text>}
      {isSendSuccess && <Text>Transaction: {JSON.stringify(sendData)}</Text>}
    </View>
  ) : null;
}
