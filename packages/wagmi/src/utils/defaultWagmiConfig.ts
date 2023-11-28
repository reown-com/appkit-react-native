import { configureChains, createConfig, type Chain, Connector } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { walletConnectProvider } from './provider';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';
import { EmailConnector } from '../connectors/EmailConnector';

export interface ConfigOptions {
  metadata?: EthereumProviderOptions['metadata'];
  projectId: string;
  chains: Chain[];
  enableEmail?: boolean
  enableWalletConnect?: boolean
}

export function defaultWagmiConfig({ projectId, chains, metadata, enableWalletConnect = true, enableEmail = false }: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ]);

  const connectors: Connector[] = []

  if(enableWalletConnect) {
    connectors.push(new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }))
  }

  if(enableEmail) {
    connectors.push(new EmailConnector({ chains, options: { projectId } }))
  }

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });
}
