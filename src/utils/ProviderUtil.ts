import 'react-native-get-random-values';
import '@ethersproject/shims';
import '@walletconnect/react-native-compat';
import UniversalProvider from '@walletconnect/universal-provider';
import type { SessionTypes } from '@walletconnect/types';

export async function createUniversalProvider({
  projectId,
  relayUrl,
}: {
  projectId: string;
  relayUrl: string;
}) {
  return UniversalProvider.init({
    logger: 'info',
    relayUrl,
    projectId,
    metadata: {
      name: 'React Native V2 dApp',
      description: 'RN dApp by WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
}

export async function createSession(
  provider: UniversalProvider
): Promise<SessionTypes.Struct | undefined> {
  return provider.connect({
    namespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        chains: ['eip155:1'],
        events: ['chainChanged', 'accountsChanged'],
        rpcMap: {},
      },
    },
  });
}
