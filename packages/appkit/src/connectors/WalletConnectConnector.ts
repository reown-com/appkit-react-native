import { type Metadata, ConnectionController } from '@reown/appkit-core-react-native';
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider';
import {
  WalletConnector,
  type AppKitNetwork,
  type Namespaces,
  type ProposalNamespaces,
  type Provider,
  type WalletInfo,
  type ChainNamespace,
  type CaipNetworkId
} from '@reown/appkit-common-react-native';

export class WalletConnectConnector extends WalletConnector {
  // private override provider: IUniversalProvider;

  private constructor(provider: IUniversalProvider) {
    super({ type: 'walletconnect', provider: provider as Provider });

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
  }

  public static async create({
    projectId,
    metadata
  }: {
    projectId: string;
    metadata: Metadata;
  }): Promise<WalletConnectConnector> {
    const provider = await UniversalProvider.init({
      projectId,
      metadata
    });

    return new WalletConnectConnector(provider);
  }

  override disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  override async connect(opts: { namespaces: ProposalNamespaces; defaultChain?: CaipNetworkId }) {
    function onUri(uri: string) {
      ConnectionController.setWcUri(uri);
    }

    this.provider.on('display_uri', onUri);

    const session = await (this.provider as IUniversalProvider).connect({
      namespaces: {},
      optionalNamespaces: opts.namespaces
    });

    if (opts.defaultChain) {
      (this.provider as IUniversalProvider).setDefaultChain(opts.defaultChain);
    }

    this.namespaces = session?.namespaces as Namespaces;

    this.provider.off('display_uri', onUri);

    return this.namespaces;
  }

  override getProvider(): Provider {
    return this.provider;
  }

  override getNamespaces(): Namespaces {
    return this.namespaces ?? {};
  }

  override switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!network.caipNetworkId) throw new Error('No network provided');
    (this.provider as IUniversalProvider).setDefaultChain(network.caipNetworkId);

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
