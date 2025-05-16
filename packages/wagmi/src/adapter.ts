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
import { UniversalConnector } from './connectors/UniversalConnector';

type ConfigParams = Partial<CreateConfigParameters> & {
  networks: [Chain, ...Chain[]];
  projectId: string;
  connectors?: Connector[];
};

export class WagmiAdapter extends EVMAdapter {
  private static supportedNamespace: ChainNamespace = 'eip155';
  public wagmiChains: readonly Chain[] | undefined;
  public wagmiConfig!: Config;
  private wagmiConfigConnector?: Connector;

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
    if (!this.wagmiConfigConnector) {
      throw new Error('WagmiAdapter: AppKit connector not set or not connected via Wagmi.');
    }

    await switchChainWagmi(this.wagmiConfig, {
      chainId: network.id as number,
      connector: this.wagmiConfigConnector
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address, tokens } = params;

    if (!this.connector) throw new Error('No active AppKit connector (EVMAdapter.connector)');
    if (!network) throw new Error('No network provided');

    if (!this.wagmiConfigConnector) {
      throw new Error('WagmiAdapter: AppKit connector not properly configured with Wagmi.');
    }

    const balanceAddress =
      address ||
      this.getAccounts()?.find((acc: CaipAddress) => acc.includes(network.id.toString()));

    if (!balanceAddress) {
      return Promise.resolve({ amount: '0.00', symbol: network.nativeCurrency.symbol || 'ETH' });
    }

    const accountHex = balanceAddress.split(':')[2] as Hex;

    const token = network?.caipNetworkId && (tokens?.[network.caipNetworkId]?.address as Hex);

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
    if (this.wagmiConfigConnector) {
      await disconnectWagmiCore(this.wagmiConfig, { connector: this.wagmiConfigConnector });
      this.wagmiConfigConnector = undefined;
    } else if (this.connector) {
      await this.connector.disconnect();
      this.onDisconnect();
    }

    const evmAdapterInstance = this as any;
    if ('connector' in evmAdapterInstance) {
      evmAdapterInstance.connector = undefined;
    }
  }

  getSupportedNamespace(): ChainNamespace {
    return WagmiAdapter.supportedNamespace;
  }

  override setConnector(_connector: WalletConnector): void {
    super.setConnector(_connector);

    if (_connector && this.wagmiChains) {
      if (!this.wagmiConfigConnector) {
        // Manually add the connector to the wagmiConfig
        const connectorInstance = this.wagmiConfig._internal.connectors.setup(
          UniversalConnector(_connector)
        );

        this.wagmiConfig._internal.connectors.setState(prev => [...prev, connectorInstance]);
        this.wagmiConfigConnector = connectorInstance;

        connectorInstance.emitter.on('message', ({ type }: { type: string }) => {
          if (type === 'externalDisconnect') {
            this.onDisconnect();

            this.wagmiConfigConnector = undefined;
          }
        });

        try {
          connectWagmi(this.wagmiConfig, { connector: connectorInstance });
        } catch (error) {
          this.wagmiConfigConnector = undefined;
        }
      }
    }
  }
}
