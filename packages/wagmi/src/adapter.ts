import {
  EVMAdapter,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import {
  type Config,
  type CreateConfigParameters,
  createConfig,
  getBalance as getBalanceWagmi,
  switchChain as switchChainWagmi,
  disconnect as disconnectWagmiCore,
  connect as connectWagmi,
  type Connector
} from '@wagmi/core';
import type { Chain } from 'wagmi/chains';
import { getTransport } from './utils/helpers';
import { formatUnits, type Hex } from 'viem';
import { WalletConnectConnector } from './connectors/WalletConnectConnector';

type ConfigParams = Partial<CreateConfigParameters> & {
  networks: [Chain, ...Chain[]]; // Use Wagmi's Chain type
  projectId: string;
  connectors?: Connector[];
};

export class WagmiAdapter extends EVMAdapter {
  private static supportedNamespace: ChainNamespace = 'eip155';
  public wagmiChains: readonly Chain[] | undefined; // Use Wagmi's Chain type
  public wagmiConfig!: Config;
  private appKitWagmiConnector?: Connector; // Store the created connector instance

  constructor(configParams: ConfigParams) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: WagmiAdapter.supportedNamespace
    });
    this.wagmiChains = configParams.networks;
    this.wagmiConfig = this.createWagmiInternalConfig(configParams);
  }

  private createWagmiInternalConfig(configParams: ConfigParams): Config {
    // Connectors are typically added via wagmiConfig.connectors, but here AppKit manages the connection.
    // We'll use the `connect` action with our dynamically created connector instance.
    // So, the `connectors` array for createConfig can be empty and is added later.
    const initialConnectors: (() => Connector)[] = [];

    const transportsArr = configParams.networks.map(chain => [
      chain.id,
      getTransport({ chainId: chain.id, projectId: configParams.projectId })
    ]);
    const transports = Object.fromEntries(transportsArr);

    return createConfig({
      chains: configParams.networks,
      connectors: initialConnectors, // Empty, as we connect programmatically
      transports,
      multiInjectedProviderDiscovery: false
    });
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.appKitWagmiConnector) {
      throw new Error('WagmiAdapter: AppKit connector not set or not connected via Wagmi.');
    }

    await switchChainWagmi(this.wagmiConfig, {
      chainId: network.id as number,
      connector: this.appKitWagmiConnector
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address } = params;

    if (!this.connector) throw new Error('No active AppKit connector (EVMAdapter.connector)');
    if (!network) throw new Error('No network provided');

    if (!this.appKitWagmiConnector) {
      // Ensure our Wagmi connector wrapper is also active
      throw new Error('WagmiAdapter: AppKit connector not properly configured with Wagmi.');
    }

    const balanceAddress =
      address ||
      this.getAccounts()?.find((acc: CaipAddress) => acc.includes(network.id.toString()));

    if (!balanceAddress) {
      return Promise.resolve({ amount: '0.00', symbol: network.nativeCurrency.symbol || 'ETH' });
    }

    const accountHex = balanceAddress.split(':')[2] as Hex;

    const token =
      network?.caipNetworkId && (params.tokens?.[network.caipNetworkId]?.address as Hex);

    const balance = await getBalanceWagmi(this.wagmiConfig, {
      address: accountHex,
      chainId: network.id as number,
      token
    });

    const formattedBalance = {
      amount: formatUnits(balance.value, balance.decimals),
      symbol: balance.symbol,
      contractAddress: token ? (`${network.caipNetworkId}:${token}` as CaipAddress) : undefined
    };

    this.emit('balanceChanged', {
      namespace: this.getSupportedNamespace(),
      address: balanceAddress,
      balance: formattedBalance
    });

    return Promise.resolve(formattedBalance);
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) {
      return undefined;
    }

    const namespaces = this.connector.getNamespaces();
    if (!namespaces) {
      return undefined;
    }

    const supportedNamespaceKey = this.getSupportedNamespace();
    const accountsForNamespace = namespaces[supportedNamespaceKey];

    return accountsForNamespace?.accounts;
  }

  async disconnect(): Promise<void> {
    if (this.appKitWagmiConnector) {
      await disconnectWagmiCore(this.wagmiConfig, { connector: this.appKitWagmiConnector });
      this.appKitWagmiConnector = undefined;
    } else if (this.connector) {
      await this.connector.disconnect();
    }

    const evmAdapterInstance = this as any;
    if ('connector' in evmAdapterInstance) {
      evmAdapterInstance.connector = undefined;
    }
  }

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('WagmiAdapter: No active AppKit connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): ChainNamespace {
    return WagmiAdapter.supportedNamespace;
  }

  override setConnector(newAppKitConnector: WalletConnector): void {
    super.setConnector(newAppKitConnector);

    if (newAppKitConnector && this.wagmiChains) {
      if (!this.appKitWagmiConnector) {
        // Manually add the connector to the wagmiConfig
        const connector = this.wagmiConfig._internal.connectors.setup(
          WalletConnectConnector(newAppKitConnector)
        );
        this.wagmiConfig._internal.connectors.setState(prev => [...prev, connector]);

        this.appKitWagmiConnector = connector as unknown as Connector;

        try {
          connectWagmi(this.wagmiConfig, { connector });
        } catch (error) {
          this.appKitWagmiConnector = undefined; // Clear if connection fails
        }
      }
    }
  }
}
