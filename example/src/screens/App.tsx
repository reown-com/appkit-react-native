import '../../expo-crypto-shim.js';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { Web3Modal, Web3Button, useWeb3Modal } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';
import { Env } from '../../env';
import { sessionParams, providerMetadata } from '../constants/Config';
import { BlockchainActions } from '../components/BlockchainActions';

export default function App() {
  const { isConnected } = useWeb3Modal();

  const onCopyClipboard = async (value: string) => {
    await setStringAsync(value).then(() => {
      Alert.alert('Copied', 'Copied to clipboard');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isConnected ? <BlockchainActions /> : <Web3Button />}
      <Web3Modal
        projectId={Env.PROJECT_ID}
        onCopyClipboard={onCopyClipboard}
        providerMetadata={providerMetadata}
        sessionParams={sessionParams}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
