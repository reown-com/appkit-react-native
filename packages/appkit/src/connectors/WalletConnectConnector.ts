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
  type ConnectionProperties
} from '@reown/appkit-common-react-native';
import { getDidAddress, getDidChainId, SIWEController } from '@reown/appkit-siwe-react-native';

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
    const { siweConfig, namespaces, defaultChain, universalLink } = opts;
    function onUri(uri: string) {
      WcController.setWcUri(uri);
    }

    const provider = this.getProvider() as IUniversalProvider;

    // @ts-ignore
    provider.on('display_uri', onUri);

    let session: IUniversalProvider['session'];

    // SIWE
    const isEVMOnly = Object.keys(namespaces ?? {}).length === 1 && namespaces?.['eip155'];
    const params = await siweConfig?.getMessageParams?.();
    if (siweConfig?.options?.enabled && params && Object.keys(params).length > 0 && isEVMOnly) {
      // 1CA is only supported on EVM

      // @ts-ignore
      const result = await provider.authenticate(
        {
          ...params,
          nonce: await siweConfig.getNonce(),
          methods: namespaces?.['eip155']?.methods,
          chains: params.chains
        },
        universalLink
      );

      // Auths is an array of signed CACAO objects https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-74.md
      const signedCacao = result?.auths?.[0];
      if (signedCacao) {
        const { p, s } = signedCacao;
        const chainId = getDidChainId(p.iss);
        const address = getDidAddress(p.iss);

        try {
          // Kicks off verifyMessage and populates external states
          const message = provider?.client?.formatAuthMessage({
            request: p,
            iss: p.iss
          })!;

          await SIWEController.verifyMessage({
            message,
            signature: s.s,
            cacao: signedCacao
          });

          if (address && chainId) {
            const siweSession = {
              address,
              chainId: parseInt(chainId, 10)
            };

            SIWEController.setSession(siweSession);
            SIWEController.onSignIn?.(siweSession);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error verifying message', error);
          // eslint-disable-next-line no-console
          await provider.disconnect().catch(console.error);
          // eslint-disable-next-line no-console
          await SIWEController.signOut().catch(console.error);
          throw error;
        }
      }
      session = result?.session;
    } else {
      session = await (this.provider as IUniversalProvider).connect({
        namespaces: {},
        optionalNamespaces: namespaces
      });
    }

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

    if (defaultChain) {
      (this.provider as IUniversalProvider).setDefaultChain(defaultChain);
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
