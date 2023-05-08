import UniversalProvider from '@walletconnect/universal-provider';
import type { ProviderMetadata } from '../types/coreTypes';

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
