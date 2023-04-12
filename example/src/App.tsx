import '../expo-crypto-shim.js';
import '@walletconnect/react-native-compat';
import '@ethersproject/shims';
import { Alert, StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';

export default function App() {
  const onCopyClipboard = async (value: string) => {
    await setStringAsync(value).then(() => {
      Alert.alert('Copied', 'Copied to clipboard');
    });
  };

  return (
    <View style={styles.container}>
      <Web3Button />
      <Web3Modal
        projectId="YOUR_PROJECT_ID"
        onCopyClipboard={onCopyClipboard}
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
