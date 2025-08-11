import {
  WalletConnector,
  type AppKitNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  type ConnectionProperties,
  type ConnectOptions,
  type ConnectorInitOptions,
  type Namespaces,
  type WalletInfo,
  type Storage,
  NumberUtil,
  StringUtil
} from '@reown/appkit-common-react-native';
import { getCoinbaseNamespace } from '../utils';
import { CoinbaseProvider } from '../providers/CoinbaseProvider';
import type { CoinbaseConnectorConfig, CoinbaseSession } from '../types';

const SESSION_KEY = '@appkit/coinbase-connector/session';

export class CoinbaseConnector extends WalletConnector {
  private static readonly SUPPORTED_NAMESPACE: ChainNamespace = 'eip155';
  private config: CoinbaseConnectorConfig;

  constructor(config?: CoinbaseConnectorConfig) {
    super({ type: 'coinbase' });
    this.config = config ?? {};
  }

  override async init(ops: ConnectorInitOptions) {
    super.init(ops);

    const redirect = ops.metadata.redirect?.universal ?? ops.metadata.redirect?.native;
    if (!redirect) {
      throw new Error('CoinbaseConnector: Redirect link not found in metadata');
    }

    this.provider = new CoinbaseProvider({
      redirect,
      // use config storage, as it needs to be mmkv-compatible
      storage: this.config.storage,
      jsonRpcUrl: this.config.jsonRpcUrl
    });

    await this.restoreSession();
  }

  override async connect(
    opts?: Pick<ConnectOptions, 'namespaces' | 'defaultNetwork'>
  ): Promise<Namespaces | undefined> {
    const accounts = await this.getProvider().connect();

    if (
      opts?.defaultNetwork &&
      opts.defaultNetwork.chainNamespace === CoinbaseConnector.SUPPORTED_NAMESPACE
    ) {
      await this.switchNetwork(opts.defaultNetwork);
    }

    const namespaces = getCoinbaseNamespace(opts?.namespaces, accounts);
    this.namespaces = namespaces;
    this.saveSession(namespaces);

    return this.namespaces;
  }

  override async disconnect(): Promise<void> {
    await super.disconnect();
    this.deleteSession();
  }

  override getProvider(): CoinbaseProvider {
    if (!this.provider) {
      throw new Error('CoinbaseConnector: Provider not initialized. Call init() first.');
    }

    return this.provider as CoinbaseProvider;
  }

  override getNamespaces(): Namespaces {
    if (!this.namespaces) {
      throw new Error('CoinbaseConnector: Namespaces not initialized');
    }

    return this.namespaces;
  }

  override getChainId(): CaipNetworkId | undefined {
    const hexChainId = this.getProvider().getChainId();
    const chainId = StringUtil.hexToString(hexChainId);

    return `${CoinbaseConnector.SUPPORTED_NAMESPACE}:${chainId}` as CaipNetworkId;
  }

  override getWalletInfo(): WalletInfo | undefined {
    return {
      name: 'Coinbase Wallet',
      description: 'Your home to everything onchain',
      url: 'https://www.coinbase.com/wallet'
    };
  }

  override getProperties(): ConnectionProperties | undefined {
    return undefined;
  }

  override async switchNetwork(network: AppKitNetwork): Promise<void> {
    const provider = this.getProvider();
    const chainId_ = NumberUtil.convertNumericToHexString(network.id);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId_ }]
      });
    } catch (error: any) {
      // Indicates chain is not added to provider
      if (error?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainId_,
                chainName: network.name,
                nativeCurrency: network.nativeCurrency,
                rpcUrls: [network.rpcUrls.default?.http[0] ?? ''],
                blockExplorerUrls: [network.blockExplorers?.default.url]
              }
            ]
          });
        } catch (e) {
          console.warn('CoinbaseConnector: switchNetwork error', e);
          throw e;
        }
      }
      console.warn('CoinbaseConnector: switchNetwork error', error);
      throw error;
    }
  }

  private deleteSession(): void {
    const storage = this.getStorage();
    storage.removeItem(SESSION_KEY);
  }

  private saveSession(namespaces: Namespaces): void {
    const storage = this.getStorage();
    storage.setItem<CoinbaseSession>(SESSION_KEY, { namespaces });
  }

  override async restoreSession(): Promise<boolean> {
    const storage = this.getStorage();
    const session = await storage.getItem<CoinbaseSession>(SESSION_KEY);
    if (!session) {
      return false;
    }

    const { namespaces } = session;
    this.namespaces = namespaces;

    return true;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      throw new Error('CoinbaseConnector: Storage not initialized');
    }

    return this.storage;
  }
}
