import { ConstantsUtil, type WalletInfo } from '@reown/appkit-common-react-native';
import { DeeplinkConnector } from './DeeplinkConnector';
import type { PhantomConnectorConfig } from '../types';

const PHANTOM_BASE_URL = 'https://phantom.app/ul/v1';
const PHANTOM_CONNECTOR_STORAGE_KEY = '@appkit/phantom-connector-data';
const PHANTOM_DAPP_KEYPAIR_STORAGE_KEY = '@appkit/phantom-dapp-secret-key';

export class PhantomConnector extends DeeplinkConnector {
  constructor(config?: PhantomConnectorConfig) {
    super({ type: 'phantom', cluster: config?.cluster });
  }

  override getWalletInfo(): WalletInfo {
    return ConstantsUtil.PHANTOM_CUSTOM_WALLET;
  }

  protected getBaseUrl(): string {
    return PHANTOM_BASE_URL;
  }

  protected getStorageKey(): string {
    return PHANTOM_CONNECTOR_STORAGE_KEY;
  }

  protected getDappKeypairStorageKey(): string {
    return PHANTOM_DAPP_KEYPAIR_STORAGE_KEY;
  }

  protected getEncryptionKeyFieldName(): string {
    return 'phantom_encryption_public_key';
  }
}
