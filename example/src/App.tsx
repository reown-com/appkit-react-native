import '../expo-crypto-shim.js';
import '@walletconnect/react-native-compat';
import '@ethersproject/shims';
import { Alert, StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button } from '@web3modal/react-native';
import { setStringAsync } from 'expo-clipboard';
import { Env } from '../env';

const providerParams = {
  name: 'React Native V2 dApp',
  description: 'RN dApp by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
      ],
      chains: ['eip155:5'],
      events: ['chainChanged', 'accountsChanged'],
      rpcMap: {},
    },
  },
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
        providerParams={providerParams}
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
