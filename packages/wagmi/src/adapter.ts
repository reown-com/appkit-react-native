import {
  EVMAdapter,
  WalletConnector,
  type SignedTransaction,
  type TransactionData,
  type TransactionReceipt
} from '@reown/appkit-common-react-native';
import {
  type Config,
  type CreateConfigParameters,
  type CreateConnectorFn,
  createConfig
} from '@wagmi/core';
import type { Chain } from 'wagmi/chains';
import { getTransport } from './utils/helpers';

type ConfigParams = Partial<CreateConfigParameters> & {
  networks: [Chain, ...Chain[]];
  projectId: string;
};

export class WagmiAdapter extends EVMAdapter {
  private static supportedNamespace: string = 'eip155';
  public wagmiChains: readonly [Chain, ...Chain[]] | undefined;
  public wagmiConfig!: Config;

  constructor(configParams: ConfigParams) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: WagmiAdapter.supportedNamespace
    });
    this.wagmiChains = configParams.networks;
    this.wagmiConfig = this.createConfig(configParams);
  }

  private createConfig(configParams: ConfigParams) {
    const connectors: CreateConnectorFn[] = [];

    const transportsArr = configParams.networks.map(chain => [
      chain.id,
      getTransport({ chainId: chain.id, projectId: configParams.projectId })
    ]);

    const transports = Object.fromEntries(transportsArr);

    // const storage = createStorage({ storage: StorageUtil });

    return createConfig({
      chains: configParams.networks,
      connectors,
      transports,
      // storage,
      multiInjectedProviderDiscovery: false
      // ...wagmiConfig
    });
  }

  async signTransaction(tx: TransactionData): Promise<SignedTransaction> {
    if (!this.connector) throw new Error('No active connector');

    return this.request('eth_signTransaction', [tx]) as Promise<SignedTransaction>;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.connector) throw new Error('No active connector');

    return this.request('eth_getBalance', [address, 'latest']) as Promise<string>;
  }

  sendTransaction(/*tx: TransactionData*/): Promise<TransactionReceipt> {
    throw new Error('Method not implemented.');
  }

  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('No active connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): string {
    return WagmiAdapter.supportedNamespace;
  }

  override setConnector(connector: WalletConnector): void {
    super.setConnector(connector);
    // this.wagmiConfig.connectors = [connector];
  }
}
