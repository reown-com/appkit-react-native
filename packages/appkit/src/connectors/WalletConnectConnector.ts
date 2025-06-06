import { ConnectionController } from '@reown/appkit-core-react-native';
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider';
import {
  WalletConnector,
  type AppKitNetwork,
  type Namespaces,
  type Provider,
  type WalletInfo,
  type ChainNamespace,
  type CaipNetworkId,
  type ConnectOptions,
  type ConnectorInitOptions,
  type Metadata
} from '@reown/appkit-common-react-native';

interface WalletConnectConnectorConfig {
  projectId: string;
}

export class WalletConnectConnector extends WalletConnector {
  private readonly config: WalletConnectConnectorConfig;

  constructor(config: WalletConnectConnectorConfig) {
    super({ type: 'walletconnect' });
    this.config = config;
  }

  override async init(ops: ConnectorInitOptions) {
    super.init(ops);

    const provider = await this.getUniversalProvider({
      projectId: this.config.projectId,
      metadata: ops.metadata
    });

    this.provider = provider as Provider;

    await this.restoreSession();
  }

  private async restoreSession(): Promise<boolean> {
    const provider = this.getProvider() as IUniversalProvider;
    if (!provider) {
      return false;
    }

    if (provider.session?.namespaces) {
      this.namespaces = provider.session.namespaces as Namespaces;
    }

    if (provider.session?.peer?.metadata) {
      const metadata = provider.session?.peer.metadata;
      if (metadata) {
        this.wallet = {
          ...metadata,
          name: metadata.name,
          icon: metadata.icons?.[0]
        };
      }
    }

    return true;
  }

  private async getUniversalProvider({
    projectId,
    metadata
  }: {
    projectId: string;
    metadata: Metadata;
  }): Promise<IUniversalProvider> {
    if (!this.provider) {
      this.provider = (await UniversalProvider.init({
        projectId,
        metadata,
        storage: this.storage
      })) as Provider;
    }

    return this.provider as IUniversalProvider;
  }

  override disconnect(): Promise<void> {
    return this.getProvider().disconnect();
  }

  override async connect(opts: ConnectOptions) {
    function onUri(uri: string) {
      ConnectionController.setWcUri(uri);
    }

    const provider = this.getProvider() as IUniversalProvider;

    // @ts-ignore
    provider.on('display_uri', onUri);

    const session = await (this.provider as IUniversalProvider).connect({
      namespaces: {},
      optionalNamespaces: opts.namespaces
    });

    if (opts.defaultChain) {
      (this.provider as IUniversalProvider).setDefaultChain(opts.defaultChain);
    }

    this.namespaces = session?.namespaces as Namespaces;

    provider.off('display_uri', onUri);

    return this.namespaces;
  }

  override getProvider(): Provider {
    if (!this.provider) {
      throw new Error('WalletConnectConnector: Provider not initialized. Call init() first.');
    }

    return this.provider;
  }

  override getNamespaces(): Namespaces {
    return this.namespaces ?? {};
  }

  override switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!network) throw new Error('No network provided');

    let caipNetworkId = network.caipNetworkId ?? `eip155:${network.id}`;

    (this.provider as IUniversalProvider).setDefaultChain(caipNetworkId);

    return Promise.resolve();
  }

  override getWalletInfo(): WalletInfo | undefined {
    return this.wallet;
  }

  override getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    if (!this.namespaces || !this.namespaces[namespace]) {
      return undefined;
    }

    const chainId = (this.provider as IUniversalProvider).rpcProviders[
      namespace
    ]?.getDefaultChain();

    if (!chainId) {
      return undefined;
    }

    return `${namespace}:${chainId}` as CaipNetworkId;
  }
}
