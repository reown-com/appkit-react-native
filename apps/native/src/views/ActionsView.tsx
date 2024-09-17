import { Button, Text } from '@reown/appkit-ui-react-native';
import { View } from 'react-native';
import { useSignMessage, useAccount, useSendTransaction, useEstimateGas } from 'wagmi';
import { Hex, parseEther } from 'viem';

export function ActionsView() {
  const { isConnected } = useAccount();
  const { data, isError, isPending, isSuccess, signMessage } = useSignMessage();
  const TX = {
    to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as Hex, // vitalik.eth
    value: parseEther('0.001'),
    data: '0x' as Hex
  };
  const { data: gas, isError: isGasError } = useEstimateGas(TX);

  const {
    data: sendData,
    isPending: isSending,
    isSuccess: isSendSuccess,
    sendTransaction
  } = useSendTransaction();

  return isConnected ? (
    <View>
      <Text variant="large-600">Wagmi Actions</Text>
      <Button disabled={isPending} onPress={() => signMessage({ message: 'Hello AppKit!' })}>
        Sign
      </Button>
      {isSuccess && <Text>Signature: {data}</Text>}
      {isGasError && <Text>Error estimating gas</Text>}
      {isError && <Text>Error signing message</Text>}
      <Button disabled={isSending} onPress={() => sendTransaction({ ...TX, gas })}>
        Send
      </Button>
      {isSending && <Text>Check Wallet</Text>}
      {isSendSuccess && <Text>Transaction: {JSON.stringify(sendData)}</Text>}
    </View>
  ) : null;
}
