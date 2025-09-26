import type {
  CaipNetworkId,
  Namespaces,
  Storage,
  WalletInfo
} from '@reown/appkit-common-react-native';
import type nacl from 'tweetnacl';
import type { Connection } from '@solana/web3.js';

// --- From helpers ---

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export type SPLTokenTransactionArgs = {
  connection: Connection;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string;
};

// --- From PhantomProvider ---

export type Cluster = 'mainnet-beta' | 'testnet' | 'devnet';

export type DeeplinkConnectResult = DeeplinkSession;

export interface DeeplinkSession {
  sessionToken: string;
  userPublicKey: string;
  walletEncryptionPublicKeyBs58: string;
  cluster: Cluster;
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

export interface DeeplinkResponse {
  wallet_encryption_public_key?: string;
  nonce: string;
  data: string;
}

export interface DecryptedConnectData {
  public_key: string;
  session: string;
}

export interface DeeplinkProviderConfig {
  appScheme: string;
  dappUrl: string;
  storage: Storage;
  cluster?: Cluster;
  dappEncryptionKeyPair: nacl.BoxKeyPair;
  type: 'phantom' | 'solflare';
  baseUrl: string;
  encryptionKeyFieldName: string;
}

// Actual method names used in deeplink URLs
export type DeeplinkRpcMethod =
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAndSendTransaction'
  | 'signAllTransactions'
  | 'signMessage';

export interface DeeplinkSignTransactionParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transaction: string }
  nonce: string;
  cluster?: Cluster;
}

export interface DeeplinkSignAllTransactionsParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON: { session: string, transactions: string[] }
  nonce: string;
  cluster?: Cluster;
}

export interface DeeplinkSignMessageParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted JSON string: { message: string, session: string, display: 'utf8'|'hex' }
  nonce: string;
}

export interface DeeplinkConnectParams {
  app_url: string;
  dapp_encryption_public_key: string;
  redirect_link: string;
  cluster?: Cluster;
}

export interface DeeplinkDisconnectParams {
  dapp_encryption_public_key: string;
  redirect_link: string;
  payload: string; // Encrypted { session: string }
  nonce: string;
}

export interface DeeplinkConnectorConfig {
  type: 'phantom' | 'solflare';
  cluster?: Cluster;
}

export interface DeeplinkConnectorSessionData {
  namespaces: Namespaces;
  wallet: WalletInfo;
  currentCaipNetworkId: CaipNetworkId;
}

export type PhantomConnectorConfig = Pick<DeeplinkConnectorConfig, 'cluster'>;
export type SolflareConnectorConfig = Pick<DeeplinkConnectorConfig, 'cluster'>;
