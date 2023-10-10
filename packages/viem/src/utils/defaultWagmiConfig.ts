import { configureChains, createConfig, createStorage, type Chain } from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';
import { noopStorage } from '@wagmi/core';
import { walletConnectProvider } from './provider';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
// import { WalletConnectConnector } from '../connectors/WalletConnectConnector';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConfigOptions {
  metadata?: EthereumProviderOptions['metadata'];
  projectId: string;
  chains: Chain[];
}

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage
});

export function defaultWagmiConfig({ projectId, chains, metadata }: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ]);

  return createConfig({
    autoConnect: true,
    persister: asyncStoragePersister,
    storage: createStorage({
      storage: noopStorage
    }),
    connectors: [
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } })
    ],
    publicClient
  });
}
