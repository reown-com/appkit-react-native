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

// --- Wallet Types ---
export type SolanaWalletType = 'phantom' | 'solflare';

// --- Generic Solana Types ---
export type SolanaCluster = 'mainnet-beta' | 'testnet' | 'devnet';

// --- Generic Provider Types ---
export interface SolanaDeeplinkProviderConfig {
  appScheme: string;
  dappUrl: string;
  storage: Storage;
  dappEncryptionKeyPair: nacl.BoxKeyPair;
  walletType: SolanaWalletType;
  baseUrl: string;
  encryptionKeyFieldName: string;
}

export interface SolanaWalletSession {
  sessionToken: string;
  userPublicKey: string;
  walletEncryptionPublicKeyBs58: string;
  cluster: SolanaCluster;
}

export type SolanaConnectResult = SolanaWalletSession;

export interface SolanaDeeplinkConnectorConfig {
  walletType: SolanaWalletType;
}

// --- Request Parameter Types ---
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

// --- Deeplink Response Types ---
export interface SolanaDeeplinkResponse {
  wallet_encryption_public_key?: string; // Generic field name - actual field name is wallet-specific
  nonce: string;
  data: string;
}

export interface DecryptedConnectData {
  public_key: string;
  session: string;
}

// --- RPC Method Types ---
export type SolanaRpcMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAndSendTransaction'
  | 'signAllTransactions'
  | 'signMessage';

// --- Generic Deeplink Parameter Types ---
export interface SolanaConnectParams {
  app_url: string;
  dapp_encryption_public_key: string;
  redirect_link: string;
  cluster?: SolanaCluster;
}

export interface SolanaDisconnectParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted { session: string }
  nonce: string;
}

export interface SolanaSignTransactionParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transaction: string }
  nonce: string;
  cluster?: SolanaCluster;
}

export interface SolanaSignAllTransactionsParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transactions: string[] }
  nonce: string;
  cluster?: SolanaCluster;
}

export interface SolanaSignMessageParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON string: { message: string, session: string, display: 'utf8'|'hex' }
  nonce: string;
}

export interface SolanaConnectorConfig {
  cluster?: SolanaCluster;
}

export interface SolanaConnectorSessionData {
  namespaces: Namespaces;
  wallet: WalletInfo;
  currentCaipNetworkId: CaipNetworkId;
}
