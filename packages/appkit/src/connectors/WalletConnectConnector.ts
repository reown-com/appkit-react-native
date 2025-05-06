import { type Metadata, ConnectionController } from '@reown/appkit-core-react-native';
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider';
import {
  WalletConnector,
  type AppKitNetwork,
  type Namespaces,
  type ProposalNamespaces,
  type Provider,
  type WalletInfo
} from '@reown/appkit-common-react-native';

export class WalletConnectConnector extends WalletConnector {
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

  override async connect(namespaces: ProposalNamespaces) {
    function onUri(uri: string) {
      ConnectionController.setWcUri(uri);
    }

    this.provider.on('display_uri', onUri);

    const session = await this.provider.connect<IUniversalProvider['session']>({
      optionalNamespaces: namespaces
    });

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
}
