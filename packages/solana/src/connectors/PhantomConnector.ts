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
  type ConnectionProperties,
  ConstantsUtil
} from '@reown/appkit-common-react-native';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

import { PhantomProvider, SOLANA_SIGNING_METHODS } from '../providers/PhantomProvider';
import type {
  PhantomCluster,
  PhantomConnectorConfig,
  PhantomConnectorSessionData,
  PhantomProviderConfig
} from '../types';

const SOLANA_CLUSTER_TO_CHAIN_ID: Record<PhantomCluster, CaipNetworkId> = {
  'mainnet-beta': solana.caipNetworkId,
  'testnet': solanaTestnet.caipNetworkId,
  'devnet': solanaDevnet.caipNetworkId
};

const PHANTOM_CONNECTOR_STORAGE_KEY = '@appkit/phantom-connector-data';
const DAPP_KEYPAIR_STORAGE_KEY = '@appkit/phantom-dapp-secret-key';

export class PhantomConnector extends WalletConnector {
  private readonly config: PhantomConnectorConfig;
  private currentCaipNetworkId: CaipNetworkId | null = null;
  private dappEncryptionKeyPair?: nacl.BoxKeyPair;

  private static readonly SUPPORTED_NAMESPACE: ChainNamespace = 'solana';

  constructor(config?: PhantomConnectorConfig) {
    super({ type: 'phantom' });
    this.config = config ?? { cluster: 'mainnet-beta' };
  }

  override async init(ops: ConnectorInitOptions) {
    super.init(ops);
    this.storage = ops.storage;
    await this.initializeKeyPair();

    const appScheme = ops.metadata.redirect?.universal ?? ops.metadata.redirect?.native;
    if (!appScheme) {
      throw new Error(
        'Phantom Connector: No redirect link found in metadata. Please add redirect.universal or redirect.native to the metadata.'
      );
    }

    const providerConfig: PhantomProviderConfig = {
      appScheme,
      dappUrl: ops.metadata.url,
      storage: ops.storage,
      dappEncryptionKeyPair: this.dappEncryptionKeyPair!
    };

    this.provider = new PhantomProvider(providerConfig);
    await this.restoreSession();
  }

  private async initializeKeyPair(): Promise<void> {
    try {
      const secretKeyB58 = await this.getStorage().getItem(DAPP_KEYPAIR_STORAGE_KEY);
      if (secretKeyB58) {
        const secretKey = bs58.decode(secretKeyB58);
        this.dappEncryptionKeyPair = nacl.box.keyPair.fromSecretKey(secretKey);
      } else {
        const newKeyPair = nacl.box.keyPair();
        this.dappEncryptionKeyPair = newKeyPair;
        await this.getStorage().setItem(
          DAPP_KEYPAIR_STORAGE_KEY,
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
    if (this.isConnected()) {
      return this.namespaces;
    }

    const defaultChain: CaipNetworkId | undefined =
      opts?.defaultChain?.split(':')?.[0] === 'solana'
        ? opts?.defaultChain
        : opts?.namespaces?.['solana']?.chains?.[0];

    const requestedCluster =
      this.config.cluster ??
      (Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID).find(
        key => SOLANA_CLUSTER_TO_CHAIN_ID[key as PhantomCluster] === defaultChain
      ) as PhantomCluster | undefined);

    try {
      const connectResult = await this.getProvider().connect({ cluster: requestedCluster });

      const solanaChainId = SOLANA_CLUSTER_TO_CHAIN_ID[connectResult.cluster];
      if (!solanaChainId) {
        throw new Error(
          `Phantom Connect: Internal - Unknown cluster mapping for ${connectResult.cluster}`
        );
      }
      this.currentCaipNetworkId = solanaChainId;

      this.wallet = {
        name: ConstantsUtil.PHANTOM_CUSTOM_WALLET.name
      };

      const userPublicKey = this.getProvider().getUserPublicKey();
      if (!userPublicKey) {
        throw new Error('Phantom Connect: Provider failed to return a user public key.');
      }

      const caipAddress = `${this.currentCaipNetworkId}:${userPublicKey}` as CaipAddress;
      this.namespaces = {
        [PhantomConnector.SUPPORTED_NAMESPACE]: {
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
      // console.warn(`PhantomConnector: Error during provider disconnect: ${error.message}. Proceeding with local clear.`);
    }

    // Cleanup provider resources
    if (this.provider) {
      (this.provider as PhantomProvider).destroy();
    }

    await this.clearSession();
  }

  private async clearSession(): Promise<void> {
    this.namespaces = undefined;
    this.wallet = undefined;
    this.currentCaipNetworkId = null;
    await this.clearSessionStorage();
  }

  override getProvider(): PhantomProvider {
    if (!this.provider) {
      throw new Error('Phantom Connector: Provider not initialized. Call init() first.');
    }

    return this.provider as PhantomProvider;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      throw new Error('Phantom Connector: Storage not initialized. Call init() first.');
    }

    return this.storage;
  }

  override getNamespaces(): Namespaces {
    if (!this.namespaces) {
      throw new Error('Phantom Connector: Not connected. Call connect() first.');
    }

    return this.namespaces;
  }

  override getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    if (namespace === PhantomConnector.SUPPORTED_NAMESPACE) {
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
    const targetClusterName = Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID).find(
      key => SOLANA_CLUSTER_TO_CHAIN_ID[key as PhantomCluster] === network.caipNetworkId
    ) as PhantomCluster | undefined;

    if (!targetClusterName) {
      throw new Error(`Cannot switch to unsupported network ID: ${network.id}`);
    }

    const currentClusterName = Object.keys(SOLANA_CLUSTER_TO_CHAIN_ID).find(
      key => SOLANA_CLUSTER_TO_CHAIN_ID[key as PhantomCluster] === this.currentCaipNetworkId
    ) as PhantomCluster | undefined;

    if (targetClusterName === currentClusterName && this.isConnected()) {
      return Promise.resolve();
    }

    // Phantom doesn't provide a way to switch network, so we need to disconnect and reconnect.
    await this.disconnect(); // Clear current session

    // Create a temporary options object to guide the new connection
    const tempConnectOpts: ConnectOptions = {
      defaultChain: SOLANA_CLUSTER_TO_CHAIN_ID[targetClusterName]
    };

    // Attempt to connect to the new cluster
    // The connect method will use the defaultChain from opts to determine the cluster.
    await this.connect(tempConnectOpts);
    this.getProvider().emit('chainChanged', network.id);

    // Verify if the connection was successful and to the correct new network
    if (
      !this.isConnected() ||
      this.getChainId(PhantomConnector.SUPPORTED_NAMESPACE) !== tempConnectOpts.defaultChain
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
      const connectorData = await this.getStorage().getItem<PhantomConnectorSessionData>(
        PHANTOM_CONNECTOR_STORAGE_KEY
      );
      if (!connectorData) {
        return false; // Provider session exists but connector data is missing
      }

      this.namespaces = connectorData.namespaces;
      this.wallet = connectorData.wallet;
      this.currentCaipNetworkId = connectorData.currentCaipNetworkId;

      // await this.initializeKeyPair();

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

    const connectorData: PhantomConnectorSessionData = {
      namespaces: this.namespaces,
      wallet: this.wallet,
      currentCaipNetworkId: this.currentCaipNetworkId
    };

    try {
      await this.getStorage().setItem(PHANTOM_CONNECTOR_STORAGE_KEY, connectorData);
    } catch (error) {
      // console.error('PhantomConnector: Failed to save session.', error);
    }
  }

  // Clears only connector-specific data from storage
  private async clearSessionStorage(): Promise<void> {
    try {
      await this.getStorage().removeItem(PHANTOM_CONNECTOR_STORAGE_KEY);
    } catch (error) {
      // console.error('PhantomConnector: Failed to clear session from storage.', error);
    }
  }
}
