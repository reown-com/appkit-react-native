import type {
  CaipNetworkId,
  Namespaces,
  Storage,
  WalletInfo
} from '@reown/appkit-common-react-native';
import type nacl from 'tweetnacl';

// --- From helpers ---

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// --- From PhantomProvider ---

export type PhantomCluster = 'mainnet-beta' | 'testnet' | 'devnet';

export interface PhantomProviderConfig {
  appScheme: string;
  dappUrl: string;
  storage: Storage;
  dappEncryptionKeyPair: nacl.BoxKeyPair;
}

export type PhantomConnectResult = PhantomSession;

export interface PhantomSession {
  sessionToken: string;
  userPublicKey: string;
  phantomEncryptionPublicKeyBs58: string;
  cluster: PhantomCluster;
}

export interface SignTransactionRequestParams {
  transaction: string;
}
export interface SignMessageRequestParams {
  message: Uint8Array | string;
  display?: 'utf8' | 'hex';
}
export interface SignAllTransactionsRequestParams {
  transactions: string[];
}

export interface PhantomDeeplinkResponse {
  phantom_encryption_public_key?: string;
  nonce: string;
  data: string;
}

export interface DecryptedConnectData {
  public_key: string;
  session: string;
}

export interface PhantomProviderConfig {
  appScheme: string;
  dappUrl: string;
  storage: Storage;
  dappEncryptionKeyPair: nacl.BoxKeyPair;
}

export interface PhantomSession {
  sessionToken: string;
  userPublicKey: string;
  phantomEncryptionPublicKeyBs58: string;
  cluster: PhantomCluster;
}

// Actual method names used in Phantom deeplink URLs
export type PhantomRpcMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAndSendTransaction'
  | 'signAllTransactions'
  | 'signMessage';

export interface PhantomSignTransactionParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transaction: string }
  nonce: string;
  cluster?: PhantomCluster;
}

export interface PhantomSignAllTransactionsParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transactions: string[] }
  nonce: string;
  cluster?: PhantomCluster;
}

export interface PhantomSignMessageParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON string: { message: string, session: string, display: 'utf8'|'hex' }
  nonce: string;
}

export interface PhantomConnectParams {
  app_url: string;
  dapp_encryption_public_key: string;
  redirect_link: string;
  cluster?: PhantomCluster;
}

export interface PhantomDisconnectParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted { session: string }
  nonce: string;
}

// --- From PhantomConnector ---

export interface PhantomConnectorConfig {
  cluster?: PhantomCluster;
}

export interface PhantomConnectorSessionData {
  namespaces: Namespaces;
  wallet: WalletInfo;
  currentCaipNetworkId: CaipNetworkId;
}
