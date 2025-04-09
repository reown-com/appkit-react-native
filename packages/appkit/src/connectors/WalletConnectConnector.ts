import { type Metadata, ConnectionController } from '@reown/appkit-core-react-native';
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider';
import { WalletConnector, type Provider } from '../adapters/types';

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

  async connect(namespaces?: string[]): Promise<any> {
    //TODO: use namespaces
    this.namespaces = namespaces;

    function onUri(uri: string) {
      ConnectionController.setWcUri(uri);
    }

    this.provider.on('display_uri', onUri);

    const session = await this.provider.connect<IUniversalProvider['session']>({
      optionalNamespaces: {
        eip155: {
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData'
          ],
          chains: ['eip155:1'],
          events: ['chainChanged', 'accountsChanged']
        },
        solana: {
          methods: ['solana_signMessage'],
          chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          events: ['chainChanged', 'accountsChanged']
        }
      }
    });

    const approvedNamespaces = Object.keys(session?.namespaces ?? {});
    console.log('session', approvedNamespaces);

    this.provider.off('display_uri', onUri);

    return approvedNamespaces;
  }

  override getProvider(): Provider {
    return this.provider;
  }

  override getNamespaces(): string[] {
    return this.namespaces ?? [];
  }
}
