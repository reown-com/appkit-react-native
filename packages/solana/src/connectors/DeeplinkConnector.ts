import {
  WalletConnector,
  type AppKitNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  type ConnectOptions,
  type Namespaces,
  type CaipAddress,
  type ConnectorInitOptions,
  type Storage,
  solana,
  solanaDevnet,
  solanaTestnet,
  type ConnectionProperties
} from '@reown/appkit-common-react-native';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { DeeplinkProvider, SOLANA_SIGNING_METHODS } from '../providers/DeeplinkProvider';
import type {
  Cluster,
  DeeplinkConnectorConfig,
  DeeplinkConnectorSessionData,
  DeeplinkProviderConfig
} from '../types';

const SOLANA_CLUSTER_TO_NETWORK: Record<Cluster, AppKitNetwork> = {
  'mainnet-beta': solana,
  'testnet': solanaTestnet,
  'devnet': solanaDevnet
};

export abstract class DeeplinkConnector extends WalletConnector {
  private readonly config: DeeplinkConnectorConfig;
  private currentCaipNetworkId: CaipNetworkId | null = null;
  private dappEncryptionKeyPair?: nacl.BoxKeyPair;

  private static readonly SUPPORTED_NAMESPACE: ChainNamespace = 'solana';

  constructor(config: DeeplinkConnectorConfig) {
    super({ type: config.type });
    this.config = config;
  }

  // Abstract methods that wallet-specific connectors must implement
  protected abstract getBaseUrl(): string;
  protected abstract getStorageKey(): string;
  protected abstract getDappKeypairStorageKey(): string;
  protected abstract getEncryptionKeyFieldName(): string;

  override async init(ops: ConnectorInitOptions) {
    super.init(ops);
    this.storage = ops.storage;
    await this.initializeKeyPair();

    const appScheme = ops.metadata.redirect?.universal ?? ops.metadata.redirect?.native;
    if (!appScheme) {
      throw new Error(
        `${this.type} connector: No redirect link found in metadata. Please add redirect.universal or redirect.native to the metadata.`
      );
    }

    const providerConfig: DeeplinkProviderConfig = {
      appScheme,
      dappUrl: ops.metadata.url,
      storage: ops.storage,
      type: this.type as 'phantom' | 'solflare',
      cluster: this.config?.cluster ?? 'mainnet-beta',
      dappEncryptionKeyPair: this.dappEncryptionKeyPair!,
      baseUrl: this.getBaseUrl(),
      encryptionKeyFieldName: this.getEncryptionKeyFieldName()
    };

    // AppKit calls init before every connect. Cancel the previous provider's pending request and drop
    // its listeners, so it doesn't keep handling deep links next to the new one.
    if (this.provider) {
      (this.provider as DeeplinkProvider).destroy();
    }

    this.provider = new DeeplinkProvider(providerConfig);
    await this.restoreSession();
  }

  private async initializeKeyPair(): Promise<void> {
    try {
      const secretKeyB58 = await this.getStorage().getItem(this.getDappKeypairStorageKey());
      if (secretKeyB58) {
        const secretKey = bs58.decode(secretKeyB58);
        this.dappEncryptionKeyPair = nacl.box.keyPair.fromSecretKey(secretKey);
      } else {
        const newKeyPair = nacl.box.keyPair();
        this.dappEncryptionKeyPair = newKeyPair;
        await this.getStorage().setItem(
          this.getDappKeypairStorageKey(),
          bs58.encode(newKeyPair.secretKey)
        );
      }
    } catch (error) {
      // Clear the local session only; opening the wallet here would interrupt the app's startup
      await this.clearLocalSession();
      throw error;
    }
  }

  override async connect(opts?: ConnectOptions): Promise<Namespaces | undefined> {
    if (this.isConnected() && this.namespaces) {
      return this.namespaces;
    }

    const defaultNetworkId: CaipNetworkId | undefined =
      opts?.defaultNetwork?.caipNetworkId?.split(':')?.[0] === 'solana'
        ? opts?.defaultNetwork?.caipNetworkId
        : opts?.namespaces?.['solana']?.chains?.[0];

    const requestedCluster =
      this.config?.cluster ??
      (Object.keys(SOLANA_CLUSTER_TO_NETWORK).find(
        key => SOLANA_CLUSTER_TO_NETWORK[key as Cluster]?.caipNetworkId === defaultNetworkId
      ) as Cluster | undefined);

    try {
      return await this.connectToCluster(requestedCluster);
    } catch (error: any) {
      await this.clearSession();
      throw error;
    }
  }

  /**
   * Asks the wallet to connect on `cluster` and stores the new session.
   * The connector state only changes once the wallet approved, so a failed attempt keeps the previous session.
   */
  private async connectToCluster(cluster?: Cluster): Promise<Namespaces> {
    const connectResult = await this.getProvider().connect({ cluster });

    const solanaChainId = SOLANA_CLUSTER_TO_NETWORK[connectResult.cluster]?.caipNetworkId;
    if (!solanaChainId) {
      throw new Error(
        `${this.type} Connect: Internal - Unknown cluster mapping for ${connectResult.cluster}`
      );
    }

    const userPublicKey = this.getProvider().getUserPublicKey();
    if (!userPublicKey) {
      throw new Error(`${this.type} Connect: Provider failed to return a user public key.`);
    }

    this.currentCaipNetworkId = solanaChainId;
    this.wallet = {
      name: this.getWalletInfo()?.name
    };

    const caipAddress = `${solanaChainId}:${userPublicKey}` as CaipAddress;
    this.namespaces = {
      [DeeplinkConnector.SUPPORTED_NAMESPACE]: {
        accounts: [caipAddress],
        methods: Object.values(SOLANA_SIGNING_METHODS),
        events: [],
        chains: [solanaChainId]
      }
    };

    await this.saveSession(); // Save connector-specific session on successful connect

    return this.namespaces;
  }

  override async disconnect(): Promise<void> {
    try {
      if (this.isConnected()) {
        await super.disconnect();
      }
    } catch (error: any) {
      console.warn(
        `${this.type} Connector: Error during provider disconnect: ${error.message}. Proceeding with local clear.`
      );
    }

    // Cleanup provider resources
    if (this.provider) {
      (this.provider as DeeplinkProvider).destroy();
    }

    await this.clearSession();
  }

  private async clearSession(): Promise<void> {
    this.namespaces = undefined;
    this.wallet = undefined;
    this.currentCaipNetworkId = null;
    await this.clearSessionStorage();
  }

  /**
   * Clears the connector and provider sessions without contacting the wallet.
   * Used when a stored session can't be restored: opening the wallet on startup would be unexpected.
   */
  private async clearLocalSession(): Promise<void> {
    if (this.provider) {
      await (this.provider as DeeplinkProvider).clearSession();
    }
    await this.clearSession();
  }

  override getProvider(): DeeplinkProvider {
    if (!this.provider) {
      throw new Error(`${this.type} Connector: Provider not initialized. Call init() first.`);
    }

    return this.provider as DeeplinkProvider;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      throw new Error(`${this.type} Connector: Storage not initialized. Call init() first.`);
    }

    return this.storage;
  }

  override getNamespaces(): Namespaces {
    if (!this.namespaces) {
      throw new Error(`${this.type} Connector: Not connected. Call connect() first.`);
    }

    return this.namespaces;
  }

  override getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    if (namespace === DeeplinkConnector.SUPPORTED_NAMESPACE) {
      return this.currentCaipNetworkId ?? undefined;
    }

    return undefined;
  }

  override getProperties(): ConnectionProperties | undefined {
    return this.properties;
  }

  isConnected(): boolean {
    // Rely solely on the provider as the source of truth for connection status.
    const provider = this.getProvider();

    return provider.isConnected() && !!provider.getUserPublicKey();
  }

  override async switchNetwork(network: AppKitNetwork): Promise<void> {
    const targetClusterName = Object.keys(SOLANA_CLUSTER_TO_NETWORK).find(
      key => SOLANA_CLUSTER_TO_NETWORK[key as Cluster]?.caipNetworkId === network.caipNetworkId
    ) as Cluster | undefined;

    if (!targetClusterName) {
      throw new Error(
        `${this.type} Connector: Cannot switch to unsupported network ID: ${network.id}`
      );
    }

    const currentClusterName = Object.keys(SOLANA_CLUSTER_TO_NETWORK).find(
      key => SOLANA_CLUSTER_TO_NETWORK[key as Cluster]?.caipNetworkId === this.currentCaipNetworkId
    ) as Cluster | undefined;

    if (targetClusterName === currentClusterName && this.isConnected()) {
      return Promise.resolve();
    }

    // The connector was set up for a single cluster
    if (this.config?.cluster && this.config.cluster !== targetClusterName) {
      throw new Error(
        `${this.type} Connector: Failed to switch network to ${targetClusterName}. Please try connecting manually.`
      );
    }

    // Phantom/Solflare don't provide a way to switch network, so we connect again on the new cluster.
    // The current session stays in place until the wallet approves, so it's kept if the switch fails.
    // The provider isn't recreated or disconnected: the adapter's listeners stay on it, and the app doesn't
    // receive a `disconnect` event in the middle of the switch.
    await this.connectToCluster(targetClusterName);

    const provider = this.getProvider();
    const userPublicKey = provider.getUserPublicKey();
    if (userPublicKey) {
      provider.emit('accountsChanged', [userPublicKey]);
    }
    provider.emit('chainChanged', network.id);
  }

  // Orchestrates session restoration
  override async restoreSession(): Promise<boolean> {
    try {
      const providerSession = await this.getProvider().restoreSession();
      if (!providerSession) {
        return false;
      }

      // If provider session is restored, try to restore connector data
      const connectorData = await this.getStorage().getItem<DeeplinkConnectorSessionData>(
        this.getStorageKey()
      );
      if (!connectorData) {
        // Self-heal: reconstruct connector state from provider session
        const userPublicKey = this.getProvider().getUserPublicKey();
        const cluster = this.getProvider().getCurrentCluster();
        const caipNetworkId = SOLANA_CLUSTER_TO_NETWORK[cluster]?.caipNetworkId;
        if (userPublicKey && caipNetworkId) {
          this.currentCaipNetworkId = caipNetworkId;
          this.wallet = { name: this.getWalletInfo()?.name };
          const caipAddress = `${caipNetworkId}:${userPublicKey}` as CaipAddress;
          this.namespaces = {
            [DeeplinkConnector.SUPPORTED_NAMESPACE]: {
              accounts: [caipAddress],
              methods: Object.values(SOLANA_SIGNING_METHODS),
              events: [],
              chains: [caipNetworkId]
            }
          };
          await this.saveSession();
        } else {
          // Provider looks connected but we can't reconstruct state → clear everything
          await this.clearLocalSession();

          return false;
        }
      } else {
        this.namespaces = connectorData.namespaces;
        this.wallet = connectorData.wallet;
        this.currentCaipNetworkId = connectorData.currentCaipNetworkId;
      }

      // Final validation
      if (this.isConnected()) {
        return true;
      }

      // If validation fails, something is out of sync. Clear everything.
      await this.clearLocalSession();

      return false;
    } catch (error) {
      // On any error, clear the local session to ensure a clean state (without opening the wallet)
      await this.clearLocalSession();

      return false;
    }
  }

  // Saves only connector-specific data
  private async saveSession(): Promise<void> {
    if (!this.namespaces || !this.wallet || !this.currentCaipNetworkId) {
      return;
    }

    const connectorData: DeeplinkConnectorSessionData = {
      namespaces: this.namespaces,
      wallet: this.wallet,
      currentCaipNetworkId: this.currentCaipNetworkId
    };

    try {
      await this.getStorage().setItem(this.getStorageKey(), connectorData);
    } catch (error) {
      // console.error(`${this.type} Connector: Failed to save session.`, error);
    }
  }

  // Clears only connector-specific data from storage
  private async clearSessionStorage(): Promise<void> {
    try {
      await this.getStorage().removeItem(this.getStorageKey());
    } catch (error) {
      // console.error(`${this.type} Connector: Failed to clear session from storage.`, error);
    }
  }
}
