import UniversalProvider from '@walletconnect/universal-provider';
import type { SessionTypes } from '@walletconnect/types';
import type { ProviderMetadata } from 'src/types/coreTypes';

export async function createUniversalProvider({
  projectId,
  relayUrl,
  metadata,
}: {
  projectId: string;
  metadata: ProviderMetadata;
  relayUrl?: string;
}) {
  return UniversalProvider.init({
    logger: __DEV__ ? 'info' : undefined,
    relayUrl,
    projectId,
    metadata,
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
