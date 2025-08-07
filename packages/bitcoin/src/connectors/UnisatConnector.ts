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
  bitcoin,
  bitcoinTestnet,
  type ConnectionProperties,
  ConstantsUtil
} from '@reown/appkit-common-react-native';

import {
  UnisatProvider,
  BITCOIN_SIGNING_METHODS,
  type UnisatChain
} from '../providers/UnisatProvider';

const BITCOIN_CHAIN_TO_CAIP_NETWORK_ID: Record<UnisatChain, CaipNetworkId> = {
  BITCOIN_MAINNET: bitcoin.caipNetworkId,
  BITCOIN_TESTNET: bitcoinTestnet.caipNetworkId,
  BITCOIN_TESTNET4: bitcoinTestnet.caipNetworkId, // Use testnet for testnet4 TODO: review
  BITCOIN_SIGNET: bitcoinTestnet.caipNetworkId, // Use testnet for signet
  FRACTAL_BITCOIN_MAINNET: bitcoin.caipNetworkId, // Use mainnet for fractal mainnet
  FRACTAL_BITCOIN_TESTNET: bitcoinTestnet.caipNetworkId // Use testnet for fractal testnet
};

const CAIP_NETWORK_ID_TO_BITCOIN_CHAIN: Record<CaipNetworkId, UnisatChain> = {
  [bitcoin.caipNetworkId]: 'BITCOIN_MAINNET',
  [bitcoinTestnet.caipNetworkId]: 'BITCOIN_TESTNET'
};

export interface UnisatConnectorConfig {
  chain?: UnisatChain;
}

export interface UnisatConnectorSessionData {
  namespaces: Namespaces;
  wallet: WalletInfo;
  currentCaipNetworkId: CaipNetworkId;
}

const UNISAT_CONNECTOR_STORAGE_KEY = '@appkit/unisat-connector-data';

export class UnisatConnector extends WalletConnector {
  private readonly config: UnisatConnectorConfig;
  private currentCaipNetworkId: CaipNetworkId | null = null;

  private static readonly SUPPORTED_NAMESPACE: ChainNamespace = 'bip122';

  constructor(config?: UnisatConnectorConfig) {
    super({ type: 'unisat' });
    this.config = config ?? { chain: 'BITCOIN_MAINNET' };
  }

  override async init(ops: ConnectorInitOptions) {
    super.init(ops);
    this.storage = ops.storage;

    const redirectUrl = ops.metadata.redirect?.universal ?? ops.metadata.redirect?.native;
    if (!redirectUrl) {
      throw new Error(
        'UniSat Connector: No redirect link found in metadata. Please add redirect.universal or redirect.native to the metadata.'
      );
    }

    // Extract deeplink scheme from universal link or use native directly
    // Universal: https://appkit-lab.reown.com/rn_appkit_debug -> rn_appkit_debug://
    // Native: rn_appkit_debug:// -> rn_appkit_debug://
    let appScheme: string;
    if (redirectUrl.startsWith('http')) {
      // Extract scheme from universal link path
      const url = new URL(redirectUrl);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const schemeSegment = pathSegments[pathSegments.length - 1];
      appScheme = `${schemeSegment}://`;
    } else {
      // Already a deeplink scheme
      appScheme = redirectUrl.endsWith('://') ? redirectUrl : `${redirectUrl}://`;
    }

    const providerConfig = {
      appScheme,
      appName: ops.metadata.name,
      storage: ops.storage
    };

    this.provider = new UnisatProvider(providerConfig);
    await this.restoreSession();
  }

  override async connect(opts?: ConnectOptions): Promise<Namespaces | undefined> {
    if (this.isConnected()) {
      return this.namespaces;
    }

    const defaultChain: CaipNetworkId | undefined =
      opts?.defaultChain?.split(':')?.[0] === 'bip122'
        ? opts?.defaultChain
        : opts?.namespaces?.['bip122']?.chains?.[0];

    const requestedChain =
      this.config.chain ??
      (Object.keys(CAIP_NETWORK_ID_TO_BITCOIN_CHAIN).find(key => key === defaultChain)
        ? CAIP_NETWORK_ID_TO_BITCOIN_CHAIN[defaultChain as CaipNetworkId]
        : undefined);

    try {
      const connectResult = await this.getProvider().connect({
        chain: requestedChain || 'BITCOIN_MAINNET'
      });

      const bitcoinChainId = BITCOIN_CHAIN_TO_CAIP_NETWORK_ID[connectResult.chain];
      if (!bitcoinChainId) {
        throw new Error(
          `UniSat Connect: Internal - Unknown chain mapping for ${connectResult.chain}`
        );
      }
      this.currentCaipNetworkId = bitcoinChainId;

      this.wallet = {
        name: ConstantsUtil.UNISAT_CUSTOM_WALLET.name
      };

      const userAddress = this.getProvider().getUserAddress();
      if (!userAddress) {
        throw new Error('UniSat Connect: Provider failed to return a user address.');
      }

      const caipAddress = `${this.currentCaipNetworkId}:${userAddress}` as CaipAddress;
      this.namespaces = {
        [UnisatConnector.SUPPORTED_NAMESPACE]: {
          accounts: [caipAddress],
          methods: Object.values(BITCOIN_SIGNING_METHODS),
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
      // Silent fail for provider disconnect errors
    }

    // Cleanup provider resources
    if (this.provider) {
      (this.provider as UnisatProvider).destroy();
    }

    await this.clearSession();
  }

  private async clearSession(): Promise<void> {
    this.namespaces = undefined;
    this.wallet = undefined;
    this.currentCaipNetworkId = null;
    await this.clearSessionStorage();
  }

  override getProvider(): UnisatProvider {
    if (!this.provider) {
      throw new Error('UniSat Connector: Provider not initialized. Call init() first.');
    }

    return this.provider as UnisatProvider;
  }

  private getStorage(): Storage {
    if (!this.storage) {
      throw new Error('UniSat Connector: Storage not initialized. Call init() first.');
    }

    return this.storage;
  }

  override getNamespaces(): Namespaces {
    if (!this.namespaces) {
      throw new Error('UniSat Connector: Not connected. Call connect() first.');
    }

    return this.namespaces;
  }

  override getChainId(namespace: ChainNamespace): CaipNetworkId | undefined {
    if (namespace === UnisatConnector.SUPPORTED_NAMESPACE) {
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
    return this.getProvider().isConnected() && !!this.getProvider().getUserAddress();
  }

  override async switchNetwork(network: AppKitNetwork): Promise<void> {
    const targetChainName = Object.keys(BITCOIN_CHAIN_TO_CAIP_NETWORK_ID).find(
      key => BITCOIN_CHAIN_TO_CAIP_NETWORK_ID[key as UnisatChain] === network.caipNetworkId
    ) as UnisatChain | undefined;

    if (!targetChainName) {
      throw new Error(`Cannot switch to unsupported network ID: ${network.id}`);
    }

    const currentChainName = Object.keys(BITCOIN_CHAIN_TO_CAIP_NETWORK_ID).find(
      key => BITCOIN_CHAIN_TO_CAIP_NETWORK_ID[key as UnisatChain] === this.currentCaipNetworkId
    ) as UnisatChain | undefined;

    if (targetChainName === currentChainName && this.isConnected()) {
      return Promise.resolve();
    }

    try {
      // Use UniSat's switchChain method
      await this.getProvider().request({
        method: BITCOIN_SIGNING_METHODS.BITCOIN_SWITCH_CHAIN,
        params: { chain: targetChainName }
      });

      this.currentCaipNetworkId = network.caipNetworkId;

      // Update namespaces with new chain
      if (this.namespaces && this.namespaces[UnisatConnector.SUPPORTED_NAMESPACE]) {
        const userAddress = this.getProvider().getUserAddress();
        if (userAddress) {
          const caipAddress = `${this.currentCaipNetworkId}:${userAddress}` as CaipAddress;
          const namespace = this.namespaces[UnisatConnector.SUPPORTED_NAMESPACE];
          if (namespace) {
            namespace.accounts = [caipAddress];
            namespace.chains = [this.currentCaipNetworkId];
          }
        }
      }

      await this.saveSession();
      this.getProvider().emit('chainChanged', network.id);
    } catch (error: any) {
      throw new Error(`Failed to switch network to ${targetChainName}: ${error.message}`);
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
      const connectorData = await this.getStorage().getItem<UnisatConnectorSessionData>(
        UNISAT_CONNECTOR_STORAGE_KEY
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

    const connectorData: UnisatConnectorSessionData = {
      namespaces: this.namespaces,
      wallet: this.wallet,
      currentCaipNetworkId: this.currentCaipNetworkId
    };

    try {
      await this.getStorage().setItem(UNISAT_CONNECTOR_STORAGE_KEY, connectorData);
    } catch (error) {
      // Silent fail
    }
  }

  // Clears only connector-specific data from storage
  private async clearSessionStorage(): Promise<void> {
    try {
      await this.getStorage().removeItem(UNISAT_CONNECTOR_STORAGE_KEY);
    } catch (error) {
      // Silent fail
    }
  }
}
