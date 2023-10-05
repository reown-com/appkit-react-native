import '@walletconnect/react-native-compat';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import {
  Web3Modal,
  W3mButton,
  createWeb3Modal,
  useProvider,
  useWeb3ModalState
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
import { parseEther } from 'viem';

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
  projectId: '90369b5c91c6f7fffe308df2b30f3ace',
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
  const { walletClient } = useProvider();
  const { selectedNetworkId } = useWeb3ModalState();

  const onSignMessage = async () => {
    const [account] = (await walletClient()?.getAddresses()) ?? [];
    const signature = await walletClient()?.signMessage({
      account,
      message: 'hello world'
    });
    console.warn('success', signature);
  };

  const onSendTransaction = async () => {
    const [address] = (await walletClient()?.getAddresses()) ?? [];
    const activeChain = chains.find(chain => chain.id === selectedNetworkId);

    try {
      const hash = await walletClient()?.sendTransaction({
        account: address,
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
        value: parseEther('0.001'),
        data: '0x',
        chain: activeChain
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
      <Button style={styles.button} onPress={() => onSignMessage()}>
        Sign
      </Button>
      <Button style={styles.button} onPress={() => onSendTransaction()}>
        Send
      </Button>
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
  },
  button: {
    marginVertical: 6
  }
});
