import { ConstantsUtil, type WalletInfo } from '@reown/appkit-common-react-native';
import { SolanaDeeplinkConnector } from './SolanaDeeplinkConnector';

const SOLFLARE_BASE_URL = 'https://solflare.com/ul/v1';
const SOLFLARE_CONNECTOR_STORAGE_KEY = '@appkit/solflare-connector-data';
const SOLFLARE_DAPP_KEYPAIR_STORAGE_KEY = '@appkit/solflare-dapp-secret-key';

export class SolflareConnector extends SolanaDeeplinkConnector {
  constructor() {
    super({ walletType: 'solflare' });
  }

  override getWalletInfo(): WalletInfo {
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
