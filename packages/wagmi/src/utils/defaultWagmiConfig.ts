import { configureChains, createConfig, type Chain, Connector } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { walletConnectProvider } from './provider';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';
import { EmailConnector } from '../connectors/EmailConnector';

export interface ConfigOptions {
  projectId: string;
  metadata: Exclude<EthereumProviderOptions['metadata'], undefined>;
  chains: Chain[];
  enableWalletConnect?: boolean;
  enableEmail?: boolean;
  extraConnectors?: Connector[];
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableWalletConnect = true,
  enableEmail,
  extraConnectors
}: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ]);

  const connectors: Connector[] = [];

  if (enableWalletConnect) {
    connectors.push(new WalletConnectConnector({ chains, options: { projectId, metadata } }));
  }

  if (enableEmail) {
    connectors.push(new EmailConnector({ chains, options: { projectId, metadata } }));
  }

  if (extraConnectors) {
    connectors.push(...extraConnectors);
  }

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });
}
