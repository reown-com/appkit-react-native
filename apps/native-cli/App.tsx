import React from 'react';
import {StyleSheet, View, useColorScheme} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import '@walletconnect/react-native-compat';
import {PROJECT_ID} from '@env';
import {WagmiConfig} from 'wagmi';

import {
  Web3Modal,
  W3mButton,
  createWeb3Modal,
  defaultWagmiConfig,
} from '@web3modal/wagmi-react-native';

import {
  arbitrum,
  mainnet,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
} from 'wagmi/chains';

const projectId = PROJECT_ID;

const chains = [
  mainnet,
  polygon,
  arbitrum,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
];

const metadata = {
  name: 'Web3Modal v3',
  description: 'Web3Modal v3 by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'redirect://',
  },
};

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setString(value);
  },
};

const wagmiConfig = defaultWagmiConfig({chains, projectId, metadata});

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  clipboardClient,
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <WagmiConfig config={wagmiConfig}>
      <View style={[styles.container, isDarkMode && styles.dark]}>
        <W3mButton
          connectStyle={styles.button}
          accountStyle={styles.button}
          label="Connect"
          loadingLabel="Connecting..."
          balance="show"
        />
        <Web3Modal />
      </View>
    </WagmiConfig>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dark: {
    backgroundColor: '#141414',
  },
  text: {
    marginBottom: 20,
  },
  button: {
    marginVertical: 6,
  },
});
