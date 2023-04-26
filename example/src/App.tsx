import '../expo-crypto-shim.js';
import '@walletconnect/react-native-compat';
import '@ethersproject/shims';
import { Alert, StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';
import { Env } from '../env';

const providerOptions = {
  name: 'React Native V2 dApp',
  description: 'RN dApp by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

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
        projectId={Env.PROJECT_ID}
        onCopyClipboard={onCopyClipboard}
        providerOptions={providerOptions}
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
