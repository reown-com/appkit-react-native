import { configureChains, createConfig, type Chain, Connector } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { walletConnectProvider } from './provider';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';
import { CoinbaseWalletConnector } from '../connectors/CoinbaseWalletConnector';

export interface ConfigOptions {
  metadata?: EthereumProviderOptions['metadata'];
  projectId: string;
  chains: Chain[];
  enableWalletConnect?: boolean;
  enableCoinbase?: boolean;
}

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableWalletConnect = true,
  enableCoinbase
}: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ]);

  const connectors: Connector[] = [];

  if (enableWalletConnect) {
    connectors.push(new WalletConnectConnector({ chains, options: { projectId, metadata } }));
  }

  if (enableCoinbase) {
    connectors.push(
      new CoinbaseWalletConnector({
        chains,
        options: { chainId: chains?.[0]?.id, callbackURL: metadata?.redirect?.native || '' }
      })
    );
  }

  return createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });
}
