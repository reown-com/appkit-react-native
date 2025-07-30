// Adapter
export { SolanaAdapter } from './adapter';

// Generic exports
export { SolanaDeeplinkProvider, SOLANA_SIGNING_METHODS } from './providers/SolanaDeeplinkProvider';
export { SolanaDeeplinkConnector } from './connectors/SolanaDeeplinkConnector';

// Wallet-specific exports
export { PhantomConnector } from './connectors/PhantomConnector';
export { SolflareConnector } from './connectors/SolflareConnector';

// Types
export type {
  SolanaWalletType,
  SolanaCluster,
  SolanaDeeplinkProviderConfig,
  SolanaWalletSession,
  SolanaConnectResult,
  SolanaDeeplinkResponse,
  SolanaRpcMethod,
  SolanaConnectParams,
  SolanaDisconnectParams,
  SolanaSignTransactionParams,
  SolanaSignAllTransactionsParams,
  SolanaSignMessageParams,
  SolanaConnectorConfig,
  SolanaConnectorSessionData
} from './types';
