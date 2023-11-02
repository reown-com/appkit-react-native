import { configureChains, createConfig, type Chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { walletConnectProvider } from './provider';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';

export interface ConfigOptions {
  metadata?: EthereumProviderOptions['metadata'];
  projectId: string;
  chains: Chain[];
}

export function defaultWagmiConfig({ projectId, chains, metadata }: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ]);

  return createConfig({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } })
    ],
    publicClient
  });
}
