import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import '@walletconnect/react-native-compat';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  AppKit,
  AppKitButton,
  NetworkButton,
  createAppKit,
  defaultWagmiConfig
} from '@reown/appkit-wagmi-react-native';

import { authConnector } from '@reown/appkit-auth-wagmi-react-native';

import { siweConfig } from './src/utils/SiweUtils';

import { AccountView } from './src/views/AccountView';
import { ActionsView } from './src/views/ActionsView';
import { getCustomWallets } from './src/utils/misc';
import { chains } from './src/utils/WagmiUtils';

const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

const metadata = {
  name: 'AppKit RN',
  description: 'AppKit RN by Reown',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'redirect://',
    universal: 'https://appkit-lab.reown.com/rn_appkit',
    linkMode: true
  }
};

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  }
};

const auth = authConnector({ projectId, metadata });

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  extraConnectors: [auth]
});

const queryClient = new QueryClient();

const customWallets = getCustomWallets();

createAppKit({
  projectId,
  wagmiConfig,
  siweConfig,
  clipboardClient,
  customWallets,
  enableAnalytics: true,
  metadata,
  features: {
    email: true,
    socials: ['x', 'discord', 'apple', 'farcaster', 'facebook'],
    emailShowWallets: true
  }
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <View style={[styles.container, isDarkMode && styles.dark]}>
            <StatusBar style="auto" />
            <AppKitButton
              connectStyle={styles.button}
              accountStyle={styles.button}
              label="Connect"
              loadingLabel="Connecting..."
              balance="show"
            />
            <NetworkButton />
            <AccountView />
            <ActionsView />
            <AppKit />
          </View>
        </QueryClientProvider>
      </WagmiProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1
  },
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
