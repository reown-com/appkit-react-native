import {
  EVMAdapter,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type GetBalanceParams,
  type GetBalanceResponse,
  type SignedTransaction,
  type SignMessageParams,
  type SignMessageResult,
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

  async signMessage(_params: SignMessageParams): Promise<SignMessageResult> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
    if (!provider) throw new Error('No active provider');

    throw new Error('Method not implemented.');
  }

  async signTransaction(tx: TransactionData): Promise<SignedTransaction> {
    if (!this.connector) throw new Error('No active connector');

    return this.request('eth_signTransaction', [tx]) as Promise<SignedTransaction>;
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    console.log('WagmiAdapter - switchNetwork', network);
    throw new Error('Method not implemented.');
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    if (!this.connector) throw new Error('No active connector');
    const address = params.address || this.getAccounts()?.[0];

    console.log('WagmiAdapter - getBalance', address);

    return Promise.resolve({ amount: '0.00', symbol: 'ETH' });
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
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
