import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import '@walletconnect/react-native-compat';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  Web3Modal,
  W3mButton,
  W3mNetworkButton,
  createWeb3Modal,
  defaultWagmiConfig
} from '@web3modal/wagmi-react-native';

import { emailConnector } from '@web3modal/email-wagmi-react-native';

import { siweConfig } from './src/utils/SiweUtils';

import { AccountView } from './src/views/AccountView';
import { ActionsView } from './src/views/ActionsView';
import { getCustomWallets } from './src/utils/misc';
import { chains } from './src/utils/WagmiUtils';

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

const metadata = {
  name: 'AppKit RN',
  description: 'AppKit RN by WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
  redirect: {
    native: 'redirect://',
    universal: 'https://lab.web3modal.com/appkit_rn',
    linkMode: true
  }
};

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  }
};

const emailConn = emailConnector({ projectId, metadata });

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});

const queryClient = new QueryClient();

const customWallets = getCustomWallets();

createWeb3Modal({
  projectId,
  wagmiConfig,
  siweConfig,
  clipboardClient,
  customWallets,
  enableAnalytics: true,
  metadata
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
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
