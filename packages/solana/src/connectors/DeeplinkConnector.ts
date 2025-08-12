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
      dappEncryptionKeyPair: this.dappEncryptionKeyPair!,
      baseUrl: this.getBaseUrl(),
      encryptionKeyFieldName: this.getEncryptionKeyFieldName()
    };

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
      // disconnect and clear session
      await this.disconnect();
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
      this.config.cluster ??
      (Object.keys(SOLANA_CLUSTER_TO_NETWORK).find(
        key => SOLANA_CLUSTER_TO_NETWORK[key as Cluster]?.caipNetworkId === defaultNetworkId
      ) as Cluster | undefined);

    try {
      const connectResult = await this.getProvider().connect({ cluster: requestedCluster });

      const solanaChainId = SOLANA_CLUSTER_TO_NETWORK[connectResult.cluster]?.caipNetworkId;
      if (!solanaChainId) {
        throw new Error(
          `${this.type} Connect: Internal - Unknown cluster mapping for ${connectResult.cluster}`
        );
      }
      this.currentCaipNetworkId = solanaChainId;

      this.wallet = {
        name: this.getWalletInfo()?.name
      };

      const userPublicKey = this.getProvider().getUserPublicKey();
      if (!userPublicKey) {
        throw new Error(`${this.type} Connect: Provider failed to return a user public key.`);
      }

      const caipAddress = `${this.currentCaipNetworkId}:${userPublicKey}` as CaipAddress;
      this.namespaces = {
        [DeeplinkConnector.SUPPORTED_NAMESPACE]: {
          accounts: [caipAddress],
          methods: Object.values(SOLANA_SIGNING_METHODS),
          events: [],
          chains: [this.currentCaipNetworkId]
        }
      };

      await this.saveSession(); // Save connector-specific session on successful connect

      return this.namespaces;
    } catch (error: any) {
      this.clearSession();
      throw error;
    }
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

    // Phantom/Solflare don't provide a way to switch network, so we need to disconnect and reconnect.
    await this.disconnect(); // Clear current session

    // Create a temporary options object to guide the new connection
    const tempConnectOpts: ConnectOptions = {
      defaultNetwork: SOLANA_CLUSTER_TO_NETWORK[targetClusterName]
    };

    // Attempt to connect to the new cluster
    // The connect method will use the defaultNetwork from opts to determine the cluster.
    await this.connect(tempConnectOpts);
    this.getProvider().emit('chainChanged', network.id);

    // Verify if the connection was successful and to the correct new network
    if (
      !this.isConnected() ||
      this.getChainId(DeeplinkConnector.SUPPORTED_NAMESPACE) !==
        tempConnectOpts.defaultNetwork?.caipNetworkId
    ) {
      throw new Error(
        `${this.type} Connector: Failed to switch network to ${targetClusterName}. Please try connecting manually.`
      );
    }
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
          await this.disconnect();

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
      await this.disconnect();

      return false;
    } catch (error) {
      // On any error, disconnect to ensure a clean state
      await this.disconnect();

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
