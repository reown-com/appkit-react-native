import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import '@walletconnect/react-native-compat';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import {
  AppKitProvider,
  createAppKit,
  AppKit,
  AppKitButton,
  NetworkButton,
  solana,
  bitcoin
} from '@reown/appkit-react-native';

import { Button, Text } from '@reown/appkit-ui-react-native';

// import { AccountView } from './src/views/AccountView';
import { chains } from './src/utils/WagmiUtils';
import { OpenButton } from './src/components/OpenButton';
import { DisconnectButton } from './src/components/DisconnectButton';
// import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { SolanaAdapter, PhantomConnector } from '@reown/appkit-solana-react-native';
import { BitcoinAdapter } from '@reown/appkit-bitcoin-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { ActionsView } from './src/views/ActionsView';
import { WalletInfoView } from './src/views/WalletInfoView';
import { EventsView } from './src/views/EventsView';
import { storage } from './src/utils/StorageUtil';
import { siweConfig } from './src/utils/SiweUtils';

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

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  }
};

const queryClient = new QueryClient();

// const ethersAdapter = new EthersAdapter({
//   projectId
// });

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains
});

const solanaAdapter = new SolanaAdapter({
  projectId
});

const bitcoinAdapter = new BitcoinAdapter({
  projectId
});

const appKit = createAppKit({
  projectId,
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  metadata,
  siweConfig,
  networks: [...chains, solana, bitcoin],
  defaultNetwork: chains[0],
  clipboardClient,
  debug: true,
  enableAnalytics: true,
  storage,
  extraConnectors: [new PhantomConnector({ cluster: 'mainnet-beta' })]
  // tokens: {
  //   'eip155:1': {
  //     address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  //   },
  //   'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
  //     address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC SPL token
  //   }
  // }
});

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <AppKitProvider instance={appKit}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaView style={[styles.container, isDarkMode && styles.dark]}>
            <StatusBar style="auto" />
            <Text variant="medium-title-600" style={styles.title}>
              AppKit Multichain for React Native
            </Text>
            <WalletInfoView />
            <AppKitButton
              connectStyle={styles.button}
              accountStyle={styles.button}
              label="Connect"
              loadingLabel="Connecting..."
              balance="show"
            />
            <NetworkButton />
            <ActionsView />
            {/* <AccountView /> */}
            <OpenButton />
            <DisconnectButton />
            <Button size="sm" onPress={() => appKit.disconnect()}>
              Disconnect
            </Button>
            <EventsView style={styles.events} />
            <AppKit />
          </SafeAreaView>
          <Toast />
        </QueryClientProvider>
      </AppKitProvider>
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
  title: {
    marginBottom: 10
  },
  button: {
    marginVertical: 16
  },
  walletInfo: {
    marginBottom: 10
  },
  events: {
    marginTop: 30
  }
});
