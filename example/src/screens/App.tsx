import '../../expo-crypto-shim.js';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button, useWeb3Modal } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';
import { ethers } from 'ethers';
import { Env } from '../../env';
import { sessionParams, providerMetadata } from '../constants/Config';
import { BlockchainActions } from '../components/BlockchainActions';

export default function App() {
  const { isConnected, provider } = useWeb3Modal();
  const [web3Provider, setWeb3Provider] =
    useState<ethers.providers.Web3Provider>();

  const onCopyClipboard = async (value: string) => {
    await setStringAsync(value).then(() => {
      Alert.alert('Copied', 'Copied to clipboard');
    });
  };

  useEffect(() => {
    if (!web3Provider && isConnected && provider) {
      setWeb3Provider(new ethers.providers.Web3Provider(provider));
    }
  }, [isConnected, provider, web3Provider]);

  return (
    <View style={styles.container}>
      <Web3Button />
      {isConnected && web3Provider && (
        <BlockchainActions web3Provider={web3Provider} />
      )}
      <Web3Modal
        projectId={Env.PROJECT_ID}
        onCopyClipboard={onCopyClipboard}
        providerMetadata={providerMetadata}
        sessionParams={sessionParams}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
