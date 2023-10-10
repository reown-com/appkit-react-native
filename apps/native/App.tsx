import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import {
  Web3Modal,
  W3mButton,
  createWeb3Modal,
  useProvider,
  useWeb3ModalState,
  useAccount
} from '@web3modal/viem-react-native';
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
} from 'viem/chains';

import { Button } from '@web3modal/ui-react-native';
import { parseEther, createWalletClient, custom } from 'viem';

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

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  }
};

createWeb3Modal({
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID ?? '',
  chains,
  clipboardClient,
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
  const { provider } = useProvider();
  const { selectedNetworkId } = useWeb3ModalState();
  const { isConnected, address } = useAccount();

  const onSignMessage = async () => {
    if (!provider || !address) return;

    const chain = chains.find(_chain => _chain.id === selectedNetworkId);

    // const provChain = await provider.request({ method: 'eth_chainId' });
    // console.log('provChain', provChain);
    // console.log('prov', provider.session);
    const client = createWalletClient({
      chain,
      transport: custom(provider)
    });

    const signature = await client.signMessage({
      account: address as `0x${string}`,
      message: 'hello world'
    });
    console.warn('success', signature);
  };

  const onSendTransaction = async () => {
    if (!provider || !address) return;
    const chain = chains.find(_chain => _chain.id === selectedNetworkId);

    const client = createWalletClient({
      chain,
      transport: custom(provider)
    });

    try {
      const hash = await client.sendTransaction({
        account: address as `0x${string}`,
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
        value: parseEther('0.001'),
        data: '0x'
      });

      return {
        method: 'send transaction',
        response: hash
      };
    } catch {}
  };

  return (
    <View style={[styles.container, isDarkMode && styles.dark]}>
      <StatusBar style="auto" />
      <W3mButton
        connectStyle={styles.button}
        accountStyle={styles.button}
        label="Connect"
        loadingLabel="Connecting..."
        balance="show"
      />
      <Web3Modal />
      {isConnected && (
        <>
          <Button style={styles.button} onPress={() => onSignMessage()}>
            Sign
          </Button>
          <Button style={styles.button} onPress={() => onSendTransaction()}>
            Send
          </Button>
        </>
      )}
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
  },
  button: {
    marginVertical: 6
  }
});
