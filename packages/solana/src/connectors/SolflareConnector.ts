import { ConstantsUtil, type WalletInfo } from '@reown/appkit-common-react-native';
import { DeeplinkConnector } from './DeeplinkConnector';
import type { SolflareConnectorConfig } from '../types';

const SOLFLARE_BASE_URL = 'https://solflare.com/ul/v1';
const SOLFLARE_CONNECTOR_STORAGE_KEY = '@appkit/solflare-connector-data';
const SOLFLARE_DAPP_KEYPAIR_STORAGE_KEY = '@appkit/solflare-dapp-secret-key';

export class SolflareConnector extends DeeplinkConnector {
  constructor(config: SolflareConnectorConfig) {
    super({ type: 'solflare', cluster: config.cluster });
  }

  override getWalletInfo(): WalletInfo | undefined {
    if (!this.isConnected()) {
      return undefined;
    }

    return ConstantsUtil.SOLFLARE_CUSTOM_WALLET;
  }

  protected getBaseUrl(): string {
    return SOLFLARE_BASE_URL;
  }

  protected getStorageKey(): string {
    return SOLFLARE_CONNECTOR_STORAGE_KEY;
  }

  protected getDappKeypairStorageKey(): string {
    return SOLFLARE_DAPP_KEYPAIR_STORAGE_KEY;
  }

  protected getEncryptionKeyFieldName(): string {
    return 'solflare_encryption_public_key';
  }
}
