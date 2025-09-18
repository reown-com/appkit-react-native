import { WcController } from '@reown/appkit-core-react-native';
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
  type Metadata,
  type ConnectionProperties,
  type RequestArguments
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

  override async restoreSession(): Promise<boolean> {
    const provider = this.getProvider() as IUniversalProvider;
    if (!provider) {
      return false;
    }

    if (provider.session?.namespaces) {
      this.namespaces = provider.session.namespaces as Namespaces;
    }

    if (provider.session?.sessionProperties) {
      this.properties = {
        ...provider.session.sessionProperties,
        smartAccounts: provider.session.sessionProperties['smartAccounts']
          ? JSON.parse(provider.session.sessionProperties['smartAccounts'])
          : [],
        sessionTopic: provider.session.topic
      };
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

  override async connect(opts: ConnectOptions) {
    const { namespaces, defaultNetwork } = opts;
    function onUri(uri: string) {
      WcController.setWcUri(uri);
    }

    const provider = this.getProvider() as IUniversalProvider;

    // @ts-ignore
    provider.on('display_uri', onUri);

    // TODO: Enable link mode
    const session = await (this.provider as IUniversalProvider).connect({
      namespaces: {},
      optionalNamespaces: namespaces
    });

    const metadata = session?.peer?.metadata;
    if (metadata) {
      this.wallet = {
        ...metadata,
        name: metadata?.name,
        icon: metadata?.icons?.[0]
      };
    } else {
      this.wallet = undefined;
    }

    if (defaultNetwork?.caipNetworkId) {
      (this.provider as IUniversalProvider).setDefaultChain(defaultNetwork.caipNetworkId);
    }

    if (session?.sessionProperties) {
      this.properties = {
        ...session.sessionProperties,
        smartAccounts: session.sessionProperties['smartAccounts']
          ? JSON.parse(session.sessionProperties['smartAccounts'])
          : [],
        sessionTopic: session.topic
      };
    }

    this.namespaces = session?.namespaces as Namespaces;

    provider.off('display_uri', onUri);

    return (session?.namespaces as Namespaces) ?? {};
  }

  override getProvider(namespace?: ChainNamespace): Provider {
    if (!this.provider) {
      throw new Error('WalletConnectConnector: Provider not initialized. Call init() first.');
    }

    const provider = this.provider;

    if (namespace) {
      return {
        ...this.provider,
        connect: async (params?: any) => provider.connect(params) as Promise<any>,
        disconnect: provider.disconnect.bind(provider),
        on: provider.on.bind(provider),
        off: provider.off.bind(provider),
        request: async (args: RequestArguments, chainId?: CaipNetworkId) => {
          const _chainId = this.getChainId(namespace);

          return provider.request(args, chainId || _chainId);
        }
      };
    }

    return this.provider;
  }

  override getNamespaces(): Namespaces {
    const namespaces =
      ((this.provider as IUniversalProvider)?.session?.namespaces as Namespaces) ?? {};
    this.namespaces = namespaces;

    return namespaces;
  }

  override getProperties(): ConnectionProperties | undefined {
    return this.properties;
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
    const namespaces = this.getNamespaces();
    if (!namespaces || !namespaces[namespace]) {
      return undefined;
    }

    const chainId = (this.provider as IUniversalProvider).rpcProviders[
      namespace
    ]?.getDefaultChain?.();

    if (!chainId) {
      return undefined;
    }

    return `${namespace}:${chainId}` as CaipNetworkId;
  }
}
