import {
  createConfig,
  createStorage,
  type CreateConnectorFn,
  type CreateConfigParameters
} from 'wagmi';
import type { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { StorageUtil } from '@web3modal/scaffold-utils-react-native';

import { walletConnect } from '../connectors/WalletConnectConnector';
import { getTransport } from './helpers';

export type ConfigOptions = Partial<CreateConfigParameters> & {
  projectId: string;
  metadata: Exclude<EthereumProviderOptions['metadata'], undefined>;
  chains: CreateConfigParameters['chains'];
  enableWalletConnect?: boolean;
  extraConnectors?: CreateConnectorFn[];
};

export function defaultWagmiConfig({
  projectId,
  chains,
  metadata,
  enableWalletConnect = true,
  extraConnectors,
  ...wagmiConfig
}: ConfigOptions) {
  const connectors: CreateConnectorFn[] = [];
  const transportsArr = chains.map(chain => [
    chain.id,
    getTransport({ chainId: chain.id, projectId })
  ]);
  const transports = Object.fromEntries(transportsArr);
  const storage = createStorage({ storage: StorageUtil });

  if (enableWalletConnect) {
    connectors.push(walletConnect({ projectId, metadata }));
  }

  if (extraConnectors) {
    connectors.push(...extraConnectors);
  }

  return createConfig({
    chains,
    connectors,
    transports,
    storage,
    multiInjectedProviderDiscovery: false,
    ...wagmiConfig
  });
}
