import { type Metadata, ConnectionController } from '@reown/appkit-core-react-native';
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider';
import {
  WalletConnector,
  type Namespaces,
  type ProposalNamespaces,
  type Provider
} from '@reown/appkit-common-react-native';

export class WalletConnectConnector extends WalletConnector {
  private constructor(provider: Provider) {
    super({ type: 'walletconnect', provider });
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

    //TODO: Check this
    return new WalletConnectConnector(provider as Provider);
  }

  override disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  override async connect(namespaces?: ProposalNamespaces) {
    function onUri(uri: string) {
      ConnectionController.setWcUri(uri);
    }

    this.provider.on('display_uri', onUri);

    const session = await this.provider.connect<IUniversalProvider['session']>({
      optionalNamespaces: namespaces
    });

    this.namespaces = session?.namespaces;

    console.log('session', session);

    this.provider.off('display_uri', onUri);

    return this.namespaces;
  }

  override getProvider(): Provider {
    return this.provider;
  }

  override getNamespaces(): Namespaces {
    return this.namespaces ?? {};
  }
}
