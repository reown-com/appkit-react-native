import {
  WalletConnector,
  type AppKitNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  type ConnectOptions,
  type Namespaces,
  type WalletInfo,
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

import {
  SolanaDeeplinkProvider,
  SOLANA_SIGNING_METHODS
} from '../providers/SolanaDeeplinkProvider';
import type {
  SolanaCluster,
  SolanaDeeplinkConnectorConfig,
  SolanaConnectorSessionData,
  SolanaDeeplinkProviderConfig
} from '../types';

const SOLANA_CLUSTER_TO_CHAIN_ID_PART: Record<SolanaCluster, string> = {
  'mainnet-beta': solana.id as string,
  'testnet': solanaTestnet.id as string,
  'devnet': solanaDevnet.id as string
};

export abstract class SolanaDeeplinkConnector extends WalletConnector {
  protected readonly config: SolanaDeeplinkConnectorConfig;
  protected currentCaipNetworkId: CaipNetworkId | null = null;
  protected dappEncryptionKeyPair?: nacl.BoxKeyPair;
  protected static readonly SUPPORTED_NAMESPACE: ChainNamespace = 'solana';

  constructor(config: SolanaDeeplinkConnectorConfig) {
    super({ type: config.walletType });
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
        `${this.config.walletType} Connector: No redirect link found in metadata. Please add redirect.universal or redirect.native to the metadata.`
      );
    }

    const providerConfig: SolanaDeeplinkProviderConfig = {
      appScheme,
      dappUrl: ops.metadata.url,
      storage: ops.storage,
      dappEncryptionKeyPair: this.dappEncryptionKeyPair!,
      walletType: this.config.walletType,
      baseUrl: this.getBaseUrl(),
      encryptionKeyFieldName: this.getEncryptionKeyFieldName()
    };

    this.provider = new SolanaDeeplinkProvider(providerConfig);
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
      await this.disconnect();
      throw error;
    }
  }

  override async connect(opts?: ConnectOptions): Promise<Namespaces | undefined> {
    if (this.isConnected()) {
      return this.namespaces;
    }

    const defaultChain =
      opts?.defaultChain?.split(':')?.[0] === 'solana'
        ? opts?.defaultChain?.split(':')[1]
        : opts?.namespaces?.['solana']?.chains?.[0]?.split(':')[1];

    const requestedCluster = Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID_PART).find(
      key =>
        SOLANA_CLUSTER_TO_CHAIN_ID_PART[key as keyof typeof SOLANA_CLUSTER_TO_CHAIN_ID_PART] ===
        defaultChain
    ) as SolanaCluster | undefined;

    try {
      const connectResult = await this.getProvider().connect({ cluster: requestedCluster });

      const solanaChainIdPart = SOLANA_CLUSTER_TO_CHAIN_ID_PART[connectResult.cluster];
      if (!solanaChainIdPart) {
        throw new Error(
          `${this.config.walletType} Connect: Internal - Unknown cluster mapping for ${connectResult.cluster}`
        );
      }
      this.currentCaipNetworkId = `solana:${solanaChainIdPart}` as CaipNetworkId;

      this.wallet = this.getWalletInfo();

      const userPublicKey = this.getProvider().getUserPublicKey();
      if (!userPublicKey) {
        throw new Error(
          `${this.config.walletType} Connect: Provider failed to return a user public key.`
        );
      }

      const caipAddress = `${this.currentCaipNetworkId}:${userPublicKey}` as CaipAddress;
      this.namespaces = {
        [SolanaDeeplinkConnector.SUPPORTED_NAMESPACE]: {
          accounts: [caipAddress],
          methods: Object.values(SOLANA_SIGNING_METHODS),
          events: [],
          chains: [this.currentCaipNetworkId]
        }
      };

      await this.saveSession();

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
      // console.warn(`${this.config.walletType}Connector: Error during provider disconnect: ${error.message}. Proceeding with local clear.`);
    }
    await this.clearSession();
  }

  private async clearSession(): Promise<void> {
    this.namespaces = undefined;
    this.wallet = undefined;
    this.currentCaipNetworkId = null;
    await this.clearSessionStorage();
  }

  override getProvider(): SolanaDeeplinkProvider {
    if (!this.provider) {
      throw new Error(
        `${this.config.walletType} Connector: Provider not initialized. Call init() first.`
      );
    }

    return this.provider as SolanaDeeplinkProvider;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      throw new Error(
        `${this.config.walletType} Connector: Storage not initialized. Call init() first.`
      );
    }

    return this.storage;
  }

  override getNamespaces(): Namespaces {
    if (!this.namespaces) {
      throw new Error(`${this.config.walletType} Connector: Not connected. Call connect() first.`);
    }

    return this.namespaces;
  }

  override getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    if (namespace === SolanaDeeplinkConnector.SUPPORTED_NAMESPACE) {
      return this.currentCaipNetworkId ?? undefined;
    }

    return undefined;
  }

  override getProperties(): ConnectionProperties | undefined {
    return this.properties;
  }

  override getWalletInfo(): WalletInfo | undefined {
    if (!this.isConnected()) {
      return undefined;
    }

    return this.wallet;
  }

  isConnected(): boolean {
    // Rely solely on the provider as the source of truth for connection status.
    return this.getProvider().isConnected() && !!this.getProvider().getUserPublicKey();
  }

  override async switchNetwork(network: AppKitNetwork): Promise<void> {
    const targetClusterName = Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID_PART).find(
      key =>
        SOLANA_CLUSTER_TO_CHAIN_ID_PART[key as keyof typeof SOLANA_CLUSTER_TO_CHAIN_ID_PART] ===
        network.id
    ) as SolanaCluster | undefined;

    if (!targetClusterName) {
      throw new Error(`Cannot switch to unsupported network ID: ${network.id}`);
    }

    const currentClusterName = Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID_PART).find(
      key =>
        `solana:${
          SOLANA_CLUSTER_TO_CHAIN_ID_PART[key as keyof typeof SOLANA_CLUSTER_TO_CHAIN_ID_PART]
        }` === this.currentCaipNetworkId
    ) as SolanaCluster | undefined;

    if (targetClusterName === currentClusterName && this.isConnected()) {
      return Promise.resolve();
    }

    // Solana wallets don't provide a way to switch network, so we need to disconnect and reconnect.
    await this.disconnect(); // Clear current session

    // Create a temporary options object to guide the new connection
    const tempConnectOpts: ConnectOptions = {
      defaultChain: `solana:${SOLANA_CLUSTER_TO_CHAIN_ID_PART[targetClusterName]}` as CaipNetworkId
    };

    // Attempt to connect to the new cluster
    // The connect method will use the defaultChain from opts to determine the cluster.
    await this.connect(tempConnectOpts);
    this.getProvider().emit('chainChanged', network.id);

    // Verify if the connection was successful and to the correct new network
    if (
      !this.isConnected() ||
      this.getChainId(SolanaDeeplinkConnector.SUPPORTED_NAMESPACE) !== tempConnectOpts.defaultChain
    ) {
      throw new Error(
        `Failed to switch network to ${targetClusterName}. Please try connecting manually.`
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
      const connectorData = await this.getStorage().getItem<SolanaConnectorSessionData>(
        this.getStorageKey()
      );
      if (!connectorData) {
        return false; // Provider session exists but connector data is missing
      }

      this.namespaces = connectorData.namespaces;
      this.wallet = connectorData.wallet;
      this.currentCaipNetworkId = connectorData.currentCaipNetworkId;

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

    const connectorData: SolanaConnectorSessionData = {
      namespaces: this.namespaces,
      wallet: this.wallet,
      currentCaipNetworkId: this.currentCaipNetworkId
    };

    try {
      await this.getStorage().setItem(this.getStorageKey(), connectorData);
    } catch (error) {
      // console.error(`${this.config.walletType}Connector: Failed to save session.`, error);
    }
  }

  // Clears only connector-specific data from storage
  private async clearSessionStorage(): Promise<void> {
    try {
      await this.getStorage().removeItem(this.getStorageKey());
    } catch (error) {
      // console.error(`${this.config.walletType}Connector: Failed to clear session from storage.`, error);
    }
  }
}
