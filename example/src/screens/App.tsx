import '../../expo-crypto-shim.js';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button, useWeb3Modal } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';
import { Env } from '../../env';
import { sessionParams, providerMetadata } from '../constants/Config';
import { BlockchainActions } from '../components/BlockchainActions';

export default function App() {
  const { isConnected } = useWeb3Modal();

  const onCopyClipboard = async (value: string) => {
    setStringAsync(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isConnected ? (
        <BlockchainActions />
      ) : (
        <View style={styles.connectContainer}>
          <Web3Button />
        </View>
      )}
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
  container: {
    flex: 1,
  },
  connectContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
