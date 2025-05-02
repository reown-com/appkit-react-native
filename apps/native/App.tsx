import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import * as Clipboard from 'expo-clipboard';
import '@walletconnect/react-native-compat';
// import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// import {
//   // AppKit,
//   // AppKitButton,
//   // NetworkButton,
//   // createAppKit,
//   WagmiAdapter,
//   defaultWagmiConfig
// } from '@reown/appkit-wagmi-react-native';

import { AppKitProvider, createAppKit, AppKit, AppKitButton } from '@reown/appkit-react-native';

// import { authConnector } from '@reown/appkit-auth-wagmi-react-native';
import { Button, Text } from '@reown/appkit-ui-react-native';

// import { siweConfig } from './src/utils/SiweUtils';

// import { AccountView } from './src/views/AccountView';
import { EthersActionsView } from './src/views/EthersActionsView';
// import { getCustomWallets } from './src/utils/misc';
// import { chains } from './src/utils/WagmiUtils';
// import { OpenButton } from './src/components/OpenButton';
// import { DisconnectButton } from './src/components/DisconnectButton';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { SolanaAdapter } from '@reown/appkit-solana-react-native';
import { mainnet, polygon, avalanche } from 'viem/chains';
import { solana } from './src/utils/ChainUtils';
import { SolanaActionsView } from './src/views/SolanaActionsView';
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

const metadata = {
  name: 'AppKit RN',
  description: 'AppKit RN by Reown',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'host.exp.exponent://',
    universal: 'https://appkit-lab.reown.com/rn_appkit'
  }
};

// const clipboardClient = {
//   setString: async (value: string) => {
//     await Clipboard.setStringAsync(value);
//   }
// };

// const auth = authConnector({ projectId, metadata });

// const extraConnectors = Platform.select({
//   ios: [auth],
//   android: [auth],
//   default: []
// });

// const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata,
//   extraConnectors
// });

const queryClient = new QueryClient();

// const customWallets = getCustomWallets();

// const wagmiAdapter = new WagmiAdapter({
//   wagmiConfig,
//   projectId,
//   networks: chains
// });

const ethersAdapter = new EthersAdapter({
  projectId
});

const solanaAdapter = new SolanaAdapter({
  projectId
});

// createAppKit({
//   projectId,
//   wagmiConfig,
//   siweConfig,
//   clipboardClient,
//   customWallets,
//   enableAnalytics: true,
//   metadata,
//   debug: true,
//   features: {
//     email: true,
//     socials: ['x', 'discord', 'apple'],
//     emailShowWallets: true,
//     swaps: true
//     // onramp: true
//   }
// });

const appKit = createAppKit({
  projectId,
  adapters: [ethersAdapter, solanaAdapter],
  metadata,
  networks: [mainnet, polygon, avalanche, solana]
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // <WagmiProvider config={wagmiConfig}>
    <AppKitProvider instance={appKit}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={[styles.container, isDarkMode && styles.dark]}>
          <StatusBar style="auto" />
          <Text variant="medium-title-600" style={styles.title}>
            AppKit for React Native
          </Text>
          <AppKitButton
            connectStyle={styles.button}
            accountStyle={styles.button}
            label="Connect"
            loadingLabel="Connecting..."
            balance="show"
          />
          {/* <NetworkButton /> */}
          <EthersActionsView />
          <SolanaActionsView />
          {/* <AccountView /> */}
          {/* <OpenButton /> */}
          {/* <DisconnectButton /> */}
          <Button size="sm" onPress={() => appKit.disconnect()}>
            Disconnect
          </Button>
          <AppKit />
        </SafeAreaView>
        <Toast />
      </QueryClientProvider>
    </AppKitProvider>
    // </WagmiProvider>
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
  title: {
    marginBottom: 30
  },
  button: {
    marginVertical: 6
  }
});
