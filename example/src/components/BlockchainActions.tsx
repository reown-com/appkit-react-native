import type { ethers } from 'ethers';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import type { AccountAction, IFormattedRpcResponse } from '../types/methods';
import {
  testEthSign,
  testSendTransaction,
  testSignMessage,
  testSignTransaction,
  testSignTypedData,
} from '../utils/MethodUtil';

interface Props {
  web3Provider: ethers.providers.Web3Provider;
}

export function BlockchainActions({ web3Provider }: Props) {
  const [rcpResponse, setRcpResponse] = useState<IFormattedRpcResponse>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRcpResponse(undefined);
  };

  const getEthereumActions: () => AccountAction[] = () => {
    const wrapRpcRequest =
      (
        rpcRequest: (
          web3Provider: ethers.providers.Web3Provider
        ) => Promise<IFormattedRpcResponse>
      ) =>
      async () => {
        setModalVisible(true);
        try {
          setLoading(true);
          const result = await rpcRequest(web3Provider);
          setRcpResponse(result);
        } catch (error) {
          console.error('RPC request failed:', error);
          setRcpResponse(undefined);
        } finally {
          setLoading(false);
        }
      };

    return [
      {
        method: 'eth_sendTransaction',
        callback: wrapRpcRequest(testSendTransaction),
      },
      {
        method: 'eth_signTransaction',
        callback: wrapRpcRequest(testSignTransaction),
      },
      { method: 'personal_sign', callback: wrapRpcRequest(testSignMessage) },
      { method: 'eth_sign (standard)', callback: wrapRpcRequest(testEthSign) },
      {
        method: 'eth_signTypedData',
        callback: wrapRpcRequest(testSignTypedData),
      },
    ];
  };

  return (
    <>
      <View style={styles.container}>
        {getEthereumActions().map((method) => (
          <TouchableOpacity
            style={styles.button}
            key={method.method}
            onPress={() => method.callback(web3Provider)}
          >
            <Text style={styles.buttonText}>{method.method}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={onModalClose}
        onModalHide={onModalClose}
      >
        <View style={styles.modalContainer}>
          <Text>Pending request</Text>
          <ActivityIndicator animating={loading} size="large" color="#3396FF" />
          {rcpResponse?.valid && (
            <>
              <Text style={styles.subtitle}>
                method:{' '}
                <Text style={styles.responseText}>{rcpResponse.method}</Text>
              </Text>
              <Text style={styles.subtitle}>
                address:{' '}
                <Text style={styles.responseText}>{rcpResponse.address}</Text>
              </Text>
              <Text style={styles.subtitle}>
                valid:{' '}
                <Text style={styles.responseText}>
                  {rcpResponse.valid ? 'true' : 'false'}
                </Text>
              </Text>
              <Text style={styles.subtitle}>
                result:{' '}
                <Text style={styles.responseText}>{rcpResponse.result}</Text>
              </Text>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  subtitle: {
    fontWeight: 'bold',
  },
  responseText: {
    fontWeight: 'normal',
  },
});
