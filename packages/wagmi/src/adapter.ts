import {
  EVMAdapter,
  type AppKitNetwork,
  type BlockchainAdapterInitParams,
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
  type Connector,
  watchAccount
} from '@wagmi/core';
import type { Chain } from 'wagmi/chains';
import { getTransport } from './utils/helpers';
import { formatUnits, type Hex } from 'viem';
import { UniversalConnector } from './connectors/UniversalConnector';

type ConfigParams = Partial<CreateConfigParameters> & {
  networks: readonly [Chain, ...Chain[]];
  projectId: string;
};

export class WagmiAdapter extends EVMAdapter {
  private static supportedNamespace: ChainNamespace = 'eip155';
  public wagmiChains: readonly Chain[] | undefined;
  public wagmiConfig!: Config;
  private wagmiConfigConnector?: Connector;
  private unsubscribeWatchAccount?: () => void;

  constructor(configParams: ConfigParams) {
    super({
      supportedNamespace: WagmiAdapter.supportedNamespace,
      adapterType: 'wagmi'
    });
    this.wagmiChains = configParams.networks;
    this.wagmiConfig = this.createWagmiInternalConfig(configParams);
  }

  private createWagmiInternalConfig(configParams: ConfigParams): Config {
    const transportsArr = configParams.networks.map(chain => [
      chain.id,
      getTransport({ chainId: chain.id, projectId: configParams.projectId })
    ]);
    const transports = Object.fromEntries(transportsArr);

    return createConfig({
      chains: configParams.networks,
      connectors: [...(configParams.connectors ?? [])],
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
      address: token ? (`${network.caipNetworkId}:${token}` as CaipAddress) : undefined
    };

    this.emit('balanceChanged', { address: balanceAddress, balance: formattedBalance });

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
    if (this.unsubscribeWatchAccount) {
      this.unsubscribeWatchAccount();
      this.unsubscribeWatchAccount = undefined;
    }

    if (this.wagmiConfigConnector) {
      const connectorInstance = this.wagmiConfigConnector;
      await disconnectWagmiCore(this.wagmiConfig, { connector: connectorInstance });
      this.removeWagmiConnector(connectorInstance);
    } else if (this.connector) {
      await this.connector.disconnect();
      this.onDisconnect();
    }

    this.connector = undefined;
  }

  // Called by ConnectionsController.disconnect for every adapter that shared the session,
  // including when it was disconnected from another namespace (e.g. Solana)
  override removeConnector(): void {
    this.unsubscribeWatchAccount?.();
    this.unsubscribeWatchAccount = undefined;

    if (this.wagmiConfigConnector) {
      this.removeWagmiConnector(this.wagmiConfigConnector);
    }

    super.removeConnector();
  }

  getSupportedNamespace(): ChainNamespace {
    return WagmiAdapter.supportedNamespace;
  }

  // Override subscribeToEvents to prevent double subscription
  // Wagmi handles provider events through its connector system and watchAccount
  protected override subscribeToEvents(): void {
    // Do nothing - wagmi's watchAccount in setupWatchers handles all events
  }

  override init({ connector: _connector }: BlockchainAdapterInitParams): void {
    super.init({ connector: _connector });

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
            // onDisconnect() must run first: it clears this.connector, so the wagmi `disconnect`
            // emitted by removeWagmiConnector() is ignored by watchAccount instead of emitting again
            this.onDisconnect();

            this.removeWagmiConnector(connectorInstance);
          }
        });

        // The AppKit connection stays as it is (like AppKit web, which ignores a failed wagmi
        // reconnect after the WalletConnect session is approved); wagmi just isn't connected
        connectWagmi(this.wagmiConfig, { connector: connectorInstance }).catch(error => {
          console.warn(
            `WagmiAdapter: failed to connect wagmi to the AppKit connector: ${
              (error as Error)?.message ?? error
            }`
          );
          this.removeWagmiConnector(connectorInstance);
        });
      }
    }

    this.setupWatchers();
  }

  // Removes the connector from the wagmi config and drops its wagmi connection, if any.
  // It doesn't disconnect the AppKit connector.
  private removeWagmiConnector(connectorInstance: Connector) {
    // Drop the wagmi connection through wagmi's own disconnect handler, without calling connector.disconnect()
    if (this.wagmiConfig.state.connections.has(connectorInstance.uid)) {
      connectorInstance.emitter.emit('disconnect');
    }

    connectorInstance.emitter.off('connect', this.wagmiConfig._internal.events.connect);
    this.wagmiConfig._internal.connectors.setState(prev =>
      prev.filter(c => c.uid !== connectorInstance.uid)
    );

    if (this.wagmiConfigConnector === connectorInstance) {
      this.wagmiConfigConnector = undefined;
    }
  }

  setupWatchers() {
    // Clean up existing subscription if any
    this.unsubscribeWatchAccount?.();

    this.unsubscribeWatchAccount = watchAccount(this.wagmiConfig, {
      onChange: (accountData, prevAccountData) => {
        if (!this.connector) return;

        // Handle disconnect
        if (accountData.status === 'disconnected' && prevAccountData.address) {
          if (this.wagmiConfigConnector) {
            this.removeWagmiConnector(this.wagmiConfigConnector);
          }
          this.onDisconnect();

          return;
        }

        // Handle account address changes
        if (
          accountData?.addresses &&
          accountData?.address &&
          accountData.address !== prevAccountData?.address
        ) {
          this.onAccountsChanged([...accountData.addresses]);
        }

        // Handle chain changes
        if (accountData?.chainId && accountData.chainId !== prevAccountData?.chainId) {
          this.onChainChanged(accountData.chainId?.toString());
        }
      }
    });
  }
}
