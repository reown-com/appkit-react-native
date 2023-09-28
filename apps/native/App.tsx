import '@walletconnect/react-native-compat';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Web3Modal, W3mButton, createWeb3Modal } from '@web3modal/viem-react-native';
import { mainnet } from 'viem/chains';

createWeb3Modal({
  projectId: '90369b5c91c6f7fffe308df2b30f3ace',
  defaultChain: mainnet,
  chains: [mainnet],
  metadata: {
    name: 'Web3Modal v3',
    description: 'Web3Modal v3 by WalletConnect',
    url: 'https://walletconnect.com/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'redirect://'
    }
  }
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDarkMode && styles.dark]}>
      <StatusBar style="auto" />
      <W3mButton label="Connect" loadingLabel="Connecting..." balance="show" />
      <Web3Modal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  dark: {
    backgroundColor: '#141414'
  },
  text: {
    marginBottom: 20
  }
});
