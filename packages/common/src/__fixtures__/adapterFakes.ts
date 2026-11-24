/**
 * Test fakes for the adapter and connector layer. Not part of the public API.
 *
 * They use real EventEmitters, so tests can emit wallet events and count listeners
 * instead of only checking that `on` was called.
 */
import { EventEmitter } from 'events';
// Imported by package name, so tests in other packages get the same class declarations they use
import {
  BlockchainAdapter,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type CaipNetworkId,
  type ChainNamespace,
  type ConnectionProperties,
  type ConnectorType,
  type GetBalanceResponse,
  type Namespaces,
  type Provider,
  type WalletInfo
} from '@reown/appkit-common-react-native';

export class FakeProvider extends EventEmitter implements Provider {
  public request = jest.fn().mockResolvedValue(undefined) as jest.Mock & Provider['request'];

  public connect = jest.fn().mockResolvedValue(undefined) as jest.Mock & Provider['connect'];

  public disconnect = jest.fn(async () => {});
}

export class FakeConnector extends WalletConnector {
  public fakeProvider: FakeProvider;
  private approvedNamespaces: Namespaces;
  private walletInfo?: WalletInfo;
  private connectionProperties?: ConnectionProperties;

  constructor({
    type = 'walletconnect',
    namespaces,
    walletInfo,
    properties
  }: {
    type?: ConnectorType;
    namespaces: Namespaces;
    walletInfo?: WalletInfo;
    properties?: ConnectionProperties;
  }) {
    super({ type });
    this.approvedNamespaces = namespaces;
    this.walletInfo = walletInfo ?? { name: `Fake ${type}` };
    this.connectionProperties = properties;
    this.fakeProvider = new FakeProvider();
    this.provider = this.fakeProvider;
  }

  connect = jest.fn(async () => {
    this.namespaces = this.approvedNamespaces;

    return this.approvedNamespaces;
  });

  override disconnect = jest.fn(async () => {
    await this.fakeProvider.disconnect();
    this.namespaces = undefined;
  });

  restoreSession = jest.fn(async () => {
    this.namespaces = this.approvedNamespaces;

    return true;
  });

  switchNetwork = jest.fn(async (_network: AppKitNetwork) => {});

  getProvider(): Provider {
    return this.fakeProvider;
  }

  getNamespaces(): Namespaces {
    return this.namespaces ?? this.approvedNamespaces;
  }

  getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    return this.getNamespaces()[namespace]?.chains?.[0];
  }

  getWalletInfo(): WalletInfo | undefined {
    return this.walletInfo;
  }

  getProperties(): ConnectionProperties | undefined {
    return this.connectionProperties;
  }
}

export class FakeAdapter extends BlockchainAdapter {
  public getBalance = jest.fn(
    async (): Promise<GetBalanceResponse> => ({ amount: '0', symbol: 'ETH' })
  );

  public switchNetwork = jest.fn(async (_network: AppKitNetwork) => {});

  constructor(namespace: ChainNamespace = 'eip155') {
    super({ supportedNamespace: namespace, adapterType: 'wagmi' });
  }

  getSupportedNamespace(): ChainNamespace {
    return this.supportedNamespace;
  }

  getAccounts(): CaipAddress[] | undefined {
    return this.connector?.getNamespaces()?.[this.supportedNamespace]?.accounts;
  }

  async disconnect(): Promise<void> {
    await this.connector?.disconnect();
  }
}
