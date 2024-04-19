import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import '@walletconnect/react-native-compat';
import { WagmiConfig } from 'wagmi';

import {
  Web3Modal,
  W3mButton,
  W3mNetworkButton,
  createWeb3Modal,
  defaultWagmiConfig
} from '@web3modal/wagmi-react-native';
import { EmailConnector } from '@web3modal/email-wagmi-react-native';

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
  aurora
} from 'wagmi/chains';
import { AccountView } from './src/views/AccountView';
import { ActionsView } from './src/views/ActionsView';
import { getCustomWallets } from './src/utils/misc';

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

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
  aurora
];

const metadata = {
  name: 'Web3Modal v3',
  description: 'Web3Modal v3 by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'redirect://'
  }
};

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  }
};

const emailConnector = new EmailConnector({ chains, options: { projectId, metadata } });

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [emailConnector]
});

const customWallets = getCustomWallets();

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  clipboardClient,
  customWallets,
  enableAnalytics: true,
  metadata
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <WagmiConfig config={wagmiConfig}>
      <View style={[styles.container, isDarkMode && styles.dark]}>
        <StatusBar style="auto" />
        <W3mButton
          connectStyle={styles.button}
          accountStyle={styles.button}
          label="Connect"
          loadingLabel="Connecting..."
          balance="show"
        />
        <W3mNetworkButton />
        <AccountView />
        <ActionsView />
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
    backgroundColor: '#ffffff'
  },
  dark: {
    backgroundColor: '#141414'
  },
  text: {
    marginBottom: 20
  },
  button: {
    marginVertical: 6
  }
});
