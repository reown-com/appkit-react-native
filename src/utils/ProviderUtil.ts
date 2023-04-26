import UniversalProvider from '@walletconnect/universal-provider';
import type { SessionTypes } from '@walletconnect/types';
import type { ProviderParams, SessionParams } from '../types/coreTypes';

export async function createUniversalProvider({
  projectId,
  relayUrl,
  metadata,
}: {
  projectId: string;
  metadata: ProviderParams;
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
  provider: UniversalProvider,
  sessionParams: SessionParams
): Promise<SessionTypes.Struct | undefined> {
  return provider.connect(sessionParams);
}
