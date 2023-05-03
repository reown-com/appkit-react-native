import type { ethers } from 'ethers';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import type {
  AccountAction,
  FormattedRcpError,
  FormattedRpcResponse,
} from '../types/methods';
import {
  testEthSign,
  testSendTransaction,
  testSignMessage,
  testSignTransaction,
  testSignTypedData,
} from '../utils/MethodUtil';
import { RequestModal } from './RequestModal';

interface Props {
  web3Provider: ethers.providers.Web3Provider;
}

export function BlockchainActions({ web3Provider }: Props) {
  const [rcpResponse, setRcpResponse] = useState<FormattedRpcResponse>();
  const [rcpError, setRcpError] = useState<FormattedRcpError>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onModalClose = () => {
    setModalVisible(false);
    setLoading(false);
    setRcpResponse(undefined);
    setRcpError(undefined);
  };

  const getEthereumActions: () => AccountAction[] = () => {
    const wrapRpcRequest =
      (
        method: string,
        rpcRequest: (
          web3Provider: ethers.providers.Web3Provider
        ) => Promise<FormattedRpcResponse>
      ) =>
      async () => {
        setRcpResponse(undefined);
        setRcpError(undefined);
        setModalVisible(true);
        try {
          setLoading(true);
          const result = await rpcRequest(web3Provider);
          setRcpResponse(result);
          setRcpError(undefined);
        } catch (error: any) {
          console.error('RPC request failed:', error);
          setRcpResponse(undefined);
          setRcpError({ method, error: error?.message });
        } finally {
          setLoading(false);
        }
      };

    return [
      {
        method: 'eth_sendTransaction',
        callback: wrapRpcRequest('eth_sendTransaction', testSendTransaction),
      },
      {
        method: 'eth_signTransaction',
        callback: wrapRpcRequest('eth_signTransaction', testSignTransaction),
      },
      {
        method: 'personal_sign',
        callback: wrapRpcRequest('personal_sign', testSignMessage),
      },
      {
        method: 'eth_sign (standard)',
        callback: wrapRpcRequest('eth_sign (standard)', testEthSign),
      },
      {
        method: 'eth_signTypedData',
        callback: wrapRpcRequest('eth_signTypedData', testSignTypedData),
      },
    ];
  };

  return (
    <>
      {getEthereumActions().map((method) => (
        <TouchableOpacity
          style={styles.button}
          key={method.method}
          onPress={() => method.callback(web3Provider)}
        >
          <Text style={styles.buttonText}>{method.method}</Text>
        </TouchableOpacity>
      ))}
      <RequestModal
        rcpResponse={rcpResponse}
        rcpError={rcpError}
        isLoading={loading}
        isVisible={modalVisible}
        onClose={onModalClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3396FF',
    borderRadius: 20,
    width: 180,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
  },
  modalContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  responseText: {
    fontWeight: '300',
  },
});
