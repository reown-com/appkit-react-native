import { useCallback, useEffect } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { SUBSCRIBER_EVENTS } from '@walletconnect/core';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import type { ProviderMetadata } from '../types/coreTypes';
import { createUniversalProvider } from '../utils/ProviderUtil';
import { removeDeepLinkWallet } from '../utils/StorageUtil';

interface Props {
  projectId: string;
  providerMetadata: ProviderMetadata;
  relayUrl?: string;
}

export function useConfigure({ projectId, relayUrl, providerMetadata }: Props) {
  const isDarkMode = useColorScheme() === 'dark';

  const resetApp = useCallback(() => {
    ClientCtrl.resetSession();
    AccountCtrl.resetAccount();
    WcConnectionCtrl.resetConnection();
    ConfigCtrl.resetConfig();
    removeDeepLinkWallet();
  }, []);

  const onSessionDelete = useCallback(
    ({ topic }: { topic: string }) => {
      const sessionTopic = ClientCtrl.sessionTopic();
      if (topic === sessionTopic) {
        resetApp();
      }
    },
    [resetApp]
  );

  const onDisplayUri = useCallback(async (uri: string) => {
    WcConnectionCtrl.setPairingUri(uri);
  }, []);

  useEffect(() => {
    ConfigCtrl.setThemeMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  /**
   * Fetch wallet list
   */
  useEffect(() => {
    async function fetchWallets() {
      try {
        if (!ExplorerCtrl.state.wallets.total) {
          await ExplorerCtrl.getMobileWallets({ version: 2 });
          OptionsCtrl.setIsDataLoaded(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching wallets');
      }
    }
    ConfigCtrl.setConfig({ projectId });
    fetchWallets();
  }, [projectId]);

  /**
   * Initialize provider
   */
  useEffect(() => {
    async function initProvider() {
      try {
        const provider = await createUniversalProvider({
          projectId,
          relayUrl,
          metadata: providerMetadata,
        });
        if (provider) {
          ClientCtrl.setProvider(provider);
          provider.on('display_uri', onDisplayUri);
          provider.client.core.relayer.subscriber.on(
            SUBSCRIBER_EVENTS.deleted,
            onSessionDelete
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Error initializing provider');
      }
    }
    initProvider();
    return () => {
      const provider = ClientCtrl.provider();
      provider?.removeListener('display_uri', onDisplayUri);
      provider?.client.core.relayer.subscriber.removeListener(
        SUBSCRIBER_EVENTS.deleted,
        onSessionDelete
      );
    };
  }, [projectId, providerMetadata, relayUrl, onDisplayUri, onSessionDelete]);
}
