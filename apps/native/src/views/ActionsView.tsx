import { Button, Text, FlexView } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import {
  useSignMessage,
  useAccount,
  useSendTransaction,
  useEstimateGas,
  usePublicClient,
  useWalletClient
} from 'wagmi';
import { Hex, parseEther } from 'viem';
import { SendTransactionData, SignMessageData } from 'wagmi/query';
import { ToastUtils } from '../utils/ToastUtils';
import { useState } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contractConfig';

// Placeholder - replace with your actual network ID
const CURRENT_NETWORK_ID = 97; // BSC Testnet Chain ID

export function ActionsView() {
  const { isConnected, chainId, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Placeholder state for formData - connect to your actual form inputs
  const [formData, _setFormData] = useState({
    name: 'My Test Token',
    symbol: 'MTT',
    decimals: 18,
    coinIcon: 'default_logo_url' // Corresponds to _logo in ABI
  });
  // const [addressVal, _setAddressVal] = useState(address); // Not used in createToken, using connected 'address'

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

  const createTokenContract = async () => {
    if (!publicClient || !walletClient) {
      ToastUtils.showErrorToast(
        'Error',
        'Client not available. Wallet might not be connected or configured.'
      );

      return;
    }
    if (!address) {
      ToastUtils.showErrorToast('Error', 'Wallet address not found. Please connect your wallet.');

      return;
    }

    try {
      if (!isConnected || chainId !== CURRENT_NETWORK_ID) {
        ToastUtils.showErrorToast('Network Error', 'Please connect to BSC Testnet (Chain ID 97)');

        return;
      }

      // Simulate the transaction
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createToken',
        account: address, // Use the connected wallet's address
        args: [
          formData.name,
          formData.symbol,
          Number(formData.decimals), // ABI expects uint8
          parseEther('1000000'), // _initialSupply (example: 1 million tokens)
          formData.coinIcon // _logo
        ],
        // This value is the fee sent to the contract's createToken function
        // Adjust if the contract's creationFee() is different or if this value is for another purpose
        value: parseEther('0.0000001')
      });

      // Send the transaction
      const hash = await walletClient.writeContract(request);
      ToastUtils.showSuccessToast('Token Creation TX Sent', hash);

      // Optional: Wait for transaction confirmation
      // const receipt = await publicClient.waitForTransactionReceipt({ hash });
      // ToastUtils.showSuccessToast('Token Created Successfully', receipt.transactionHash);
    } catch (error: any) {
      let errorMessage = 'Token Creation Failed. ';
      if (error.shortMessage) {
        errorMessage += error.shortMessage;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'An unknown error occurred.';
      }
      ToastUtils.showErrorToast('Error', errorMessage);
    }
  };

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
      {isGasError && <Text>Error estimating gas for test send</Text>}
      <Button disabled={isSending} onPress={() => sendTransaction({ ...TX, gas })}>
        Send Test TX
      </Button>
      {isSending && <Text>Check Wallet for Test TX</Text>}
      <Button onPress={createTokenContract} disabled={!publicClient || !walletClient}>
        Create Token
      </Button>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 8
  }
});
