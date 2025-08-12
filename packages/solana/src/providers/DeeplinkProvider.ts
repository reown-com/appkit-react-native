import { Linking } from 'react-native';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import type {
  Provider,
  RequestArguments,
  CaipNetworkId,
  Storage
} from '@reown/appkit-common-react-native';
import type {
  DeeplinkProviderConfig,
  DeeplinkConnectResult,
  DeeplinkSession,
  DecryptedConnectData,
  DeeplinkResponse,
  SignAllTransactionsRequestParams,
  SignMessageRequestParams,
  SignTransactionRequestParams,
  DeeplinkRpcMethod,
  DeeplinkConnectParams,
  DeeplinkDisconnectParams,
  DeeplinkSignTransactionParams,
  DeeplinkSignMessageParams,
  DeeplinkSignAllTransactionsParams,
  Cluster
} from '../types';
import EventEmitter from 'events';

export const SOLANA_SIGNING_METHODS = {
  SOLANA_SIGN_TRANSACTION: 'solana_signTransaction',
  SOLANA_SIGN_MESSAGE: 'solana_signMessage',
  SOLANA_SIGN_AND_SEND_TRANSACTION: 'solana_signAndSendTransaction',
  SOLANA_SIGN_ALL_TRANSACTIONS: 'solana_signAllTransactions'
} as const;

type SolanaSigningMethod = Values<typeof SOLANA_SIGNING_METHODS>;

function isValidSolanaSigningMethod(method: string): method is SolanaSigningMethod {
  return Object.values(SOLANA_SIGNING_METHODS).includes(method as SolanaSigningMethod);
}

export class DeeplinkProvider extends EventEmitter implements Provider {
  private readonly config: DeeplinkProviderConfig;
  private dappEncryptionKeyPair: nacl.BoxKeyPair;
  private currentCluster: Cluster = 'mainnet-beta';
  private sharedKey: Uint8Array | null = null;

  private storage: Storage;

  private sessionToken: string | null = null;
  private userPublicKey: string | null = null;
  private walletEncryptionPublicKeyBs58: string | null = null;

  // Single subscription management - deep links are sequential by nature
  private activeSubscription: { remove: () => void } | null = null;
  private isOperationPending = false;

  constructor(config: DeeplinkProviderConfig) {
    super();
    this.config = config;
    this.dappEncryptionKeyPair = config.dappEncryptionKeyPair;
    this.storage = config.storage;
  }

  private getSessionStorageKey(): string {
    return `@appkit/${this.config.type}-provider-session`;
  }

  /**
   * Cleanup method to be called when the provider is destroyed
   */
  public destroy(): void {
    this.cleanupActiveSubscription();
    this.removeAllListeners();
  }

  /**
   * Safely cleanup the active subscription
   */
  private cleanupActiveSubscription(): void {
    if (this.activeSubscription) {
      this.activeSubscription.remove();
      this.activeSubscription = null;
    }
    this.isOperationPending = false;
  }

  /**
   * Safely set a new subscription, ensuring no operation is pending
   */
  private setActiveSubscription(subscription: { remove: () => void }): void {
    // If there's already a pending operation, reject it
    if (this.isOperationPending) {
      this.cleanupActiveSubscription();
    }
    this.activeSubscription = subscription;
    this.isOperationPending = true;
  }

  getUserPublicKey(): string | null {
    return this.userPublicKey;
  }

  isConnected(): boolean {
    return !!this.sessionToken && !!this.userPublicKey && !!this.dappEncryptionKeyPair;
  }

  public getCurrentCluster(): Cluster {
    return this.currentCluster;
  }

  private buildUrl(rpcMethod: DeeplinkRpcMethod, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();

    return `${this.config.baseUrl}/${rpcMethod}?${query}`;
  }

  /**
   * Open a deeplink URL and wait for a redirect back to the app. Handles subscription
   * lifecycle and common error extraction from `errorCode`/`errorMessage` query params.
   */
  private async openDeeplinkAndWait<T>(
    deeplinkUrl: string,
    processParams: (params: URLSearchParams) => Promise<T> | T,
    contextLabel: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const handleDeepLink = async (event: { url: string }) => {
        try {
          this.cleanupActiveSubscription();
          const fullUrl = event.url;
          if (!fullUrl.startsWith(this.config.appScheme)) {
            return reject(
              new Error(`${this.config.type} provider: ${contextLabel}: Unexpected redirect URI.`)
            );
          }
          const params = new URLSearchParams(fullUrl.substring(fullUrl.indexOf('?') + 1));
          const errorCode = params.get('errorCode');
          const errorMessage = params.get('errorMessage');
          if (errorCode) {
            return reject(
              new Error(
                `${this.config.type} provider: ${contextLabel} Failed: ${
                  errorMessage || 'Unknown error'
                } (Code: ${errorCode})`
              )
            );
          }
          const result = await Promise.resolve(processParams(params));
          resolve(result);
        } catch (error) {
          this.cleanupActiveSubscription();
          reject(error);
        }
      };

      const subscription = Linking.addEventListener('url', handleDeepLink);
      this.setActiveSubscription(subscription);

      Linking.openURL(deeplinkUrl).catch(err => {
        this.cleanupActiveSubscription();
        reject(
          new Error(
            `${this.config.type} provider: Failed to open wallet for ${contextLabel}: ${err.message}.`
          )
        );
      });
    });
  }

  private getRpcMethodName(method: SolanaSigningMethod): DeeplinkRpcMethod {
    switch (method) {
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
        return 'signTransaction';
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_AND_SEND_TRANSACTION:
        return 'signAndSendTransaction';
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS:
        return 'signAllTransactions';
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
        return 'signMessage';
      default:
        // Should not happen due to type constraints on `method`
        throw new Error(`Unsupported Solana signing method: ${method}`);
    }
  }

  private encryptPayload(
    payload: Record<string, unknown>,
    walletPublicKeyBs58: string
  ): { nonce: string; encryptedPayload: string } | null {
    if (!walletPublicKeyBs58) {
      return null;
    }
    try {
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
      let encryptedPayload: Uint8Array | null;
      if (this.sharedKey) {
        encryptedPayload = nacl.box.after(payloadBytes, nonce, this.sharedKey);
      } else {
        const walletPublicKeyBytes = bs58.decode(walletPublicKeyBs58);
        encryptedPayload = nacl.box(
          payloadBytes,
          nonce,
          walletPublicKeyBytes,
          this.dappEncryptionKeyPair.secretKey
        );
      }

      return {
        nonce: bs58.encode(nonce),
        encryptedPayload: bs58.encode(encryptedPayload)
      };
    } catch (error) {
      console.warn(`${this.config.type} provider: Failed to encrypt payload.`, error);

      return null;
    }
  }

  private decryptPayload<T>(
    encryptedDataBs58: string,
    nonceBs58: string,
    walletSenderPublicKeyBs58: string
  ): T | null {
    try {
      const formattedEncryptedDataBs58 = encryptedDataBs58.replace('#', '');
      const encryptedDataBytes = bs58.decode(formattedEncryptedDataBs58);
      const nonceBytes = bs58.decode(nonceBs58);
      let decryptedPayloadBytes: Uint8Array | null;
      if (this.sharedKey) {
        decryptedPayloadBytes = nacl.box.open.after(encryptedDataBytes, nonceBytes, this.sharedKey);
      } else {
        const walletSenderPublicKeyBytes = bs58.decode(walletSenderPublicKeyBs58);
        decryptedPayloadBytes = nacl.box.open(
          encryptedDataBytes,
          nonceBytes,
          walletSenderPublicKeyBytes,
          this.dappEncryptionKeyPair.secretKey
        );
      }
      if (!decryptedPayloadBytes) {
        return null;
      }

      return JSON.parse(Buffer.from(decryptedPayloadBytes).toString('utf8')) as T;
    } catch (error) {
      console.warn(`${this.config.type} provider: Failed to decrypt payload.`, error);

      return null;
    }
  }

  public async restoreSession(): Promise<boolean> {
    try {
      const session = await this.storage.getItem<DeeplinkSession>(this.getSessionStorageKey());
      if (session) {
        this.setSession(session);

        // Recompute shared key on session restore
        try {
          const walletPublicKeyBytes = bs58.decode(session.walletEncryptionPublicKeyBs58);
          this.sharedKey = nacl.box.before(
            walletPublicKeyBytes,
            this.dappEncryptionKeyPair.secretKey
          );
        } catch (e) {
          this.sharedKey = null;
        }

        return true;
      }

      return false;
    } catch (error) {
      // console.error(`${this.config.type} provider: Failed to restore session.`, error);
      await this.clearSessionStorage(); // Clear potentially corrupt data

      return false;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.sessionToken || !this.userPublicKey || !this.walletEncryptionPublicKeyBs58) {
      return; // Cannot save incomplete session
    }
    const session: DeeplinkSession = {
      sessionToken: this.sessionToken,
      userPublicKey: this.userPublicKey,
      walletEncryptionPublicKeyBs58: this.walletEncryptionPublicKeyBs58,
      cluster: this.currentCluster
    };
    try {
      await this.storage.setItem(this.getSessionStorageKey(), session);
    } catch (error) {
      // console.error(`${this.config.type} provider: Failed to save session.`, error);
    }
  }

  private async clearSessionStorage(): Promise<void> {
    try {
      await this.storage.removeItem(this.getSessionStorageKey());
    } catch (error) {
      // console.error(`${this.config.type} provider: Failed to clear session storage.`, error);
    }
  }

  public async connect<T = DeeplinkConnectResult>(params?: { cluster?: Cluster }): Promise<T> {
    const cluster = params?.cluster ?? 'mainnet-beta';
    this.currentCluster = cluster;
    const connectDeeplinkParams: DeeplinkConnectParams = {
      app_url: this.config.dappUrl,
      dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
      redirect_link: this.config.appScheme,
      cluster
    };
    const url = this.buildUrl('connect', connectDeeplinkParams as any);

    return this.openDeeplinkAndWait<DeeplinkConnectResult>(
      url,
      (responseUrlParams: URLSearchParams) => {
        const responsePayload: DeeplinkResponse = {
          wallet_encryption_public_key: responseUrlParams.get(this.config.encryptionKeyFieldName)!,
          nonce: responseUrlParams.get('nonce')!,
          data: responseUrlParams.get('data')!
        };
        if (
          !responsePayload.wallet_encryption_public_key ||
          !responsePayload.nonce ||
          !responsePayload.data
        ) {
          throw new Error(`${this.config.type} provider: Invalid response - missing parameters.`);
        }

        const decryptedData = this.decryptPayload<DecryptedConnectData>(
          responsePayload.data,
          responsePayload.nonce,
          responsePayload.wallet_encryption_public_key
        );
        if (!decryptedData || !decryptedData.public_key || !decryptedData.session) {
          throw new Error(
            `${this.config.type} provider: Failed to decrypt or invalid decrypted data.`
          );
        }
        this.userPublicKey = decryptedData.public_key;
        this.sessionToken = decryptedData.session;
        this.walletEncryptionPublicKeyBs58 = responsePayload.wallet_encryption_public_key;

        // Precompute shared key for subsequent communications
        try {
          const walletPublicKeyBytes = bs58.decode(this.walletEncryptionPublicKeyBs58);
          this.sharedKey = nacl.box.before(
            walletPublicKeyBytes,
            this.dappEncryptionKeyPair.secretKey
          );
        } catch (e) {
          this.sharedKey = null;
        }

        // Save session on successful connect
        this.saveSession();

        return {
          userPublicKey: this.userPublicKey!,
          sessionToken: this.sessionToken!,
          walletEncryptionPublicKeyBs58: this.walletEncryptionPublicKeyBs58!,
          cluster
        } as DeeplinkConnectResult;
      },
      'Connection'
    ) as Promise<T>;
  }

  public async disconnect(): Promise<void> {
    if (!this.sessionToken || !this.walletEncryptionPublicKeyBs58) {
      await this.clearSession();
      this.emit('disconnect');

      return Promise.resolve();
    }

    const payloadToEncrypt = { session: this.sessionToken };
    const encryptedDisconnectPayload = this.encryptPayload(
      payloadToEncrypt,
      this.walletEncryptionPublicKeyBs58
    );

    if (!encryptedDisconnectPayload) {
      // console.warn(`${this.config.type} provider: Failed to encrypt disconnect payload. Clearing session locally.`);
      await this.clearSession();
      this.emit('disconnect');

      return Promise.resolve(); // Or reject, depending on desired strictness
    }

    const disconnectDeeplinkParams: DeeplinkDisconnectParams = {
      dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
      redirect_link: this.config.appScheme,
      payload: encryptedDisconnectPayload.encryptedPayload,
      nonce: encryptedDisconnectPayload.nonce
    };
    const url = this.buildUrl('disconnect', disconnectDeeplinkParams as any);

    return this.openDeeplinkAndWait<void>(
      url,
      () => {
        this.clearSession();
      },
      'Disconnection'
    );
  }

  public async clearSession(): Promise<void> {
    this.sessionToken = null;
    this.userPublicKey = null;
    this.walletEncryptionPublicKeyBs58 = null;
    if (this.sharedKey) {
      this.sharedKey.fill(0);
    }
    this.sharedKey = null;
    this.cleanupActiveSubscription();
    await this.clearSessionStorage();
  }

  public setSession(session: DeeplinkSession): void {
    this.sessionToken = session.sessionToken;
    this.userPublicKey = session.userPublicKey;
    this.walletEncryptionPublicKeyBs58 = session.walletEncryptionPublicKeyBs58;
    this.currentCluster = session.cluster;
  }

  public async request<T>(args: RequestArguments, _chainId?: CaipNetworkId): Promise<T> {
    if (!isValidSolanaSigningMethod(args.method)) {
      throw new Error(
        `${this.config.type} provider: Unsupported method: ${args.method}. Only Solana signing methods are supported.`
      );
    }
    const signingMethod = args.method as SolanaSigningMethod;
    const requestParams = args.params as any;

    if (!this.isConnected() || !this.sessionToken || !this.walletEncryptionPublicKeyBs58) {
      throw new Error(
        `${this.config.type} provider: Not connected or session details missing. Cannot process request.`
      );
    }

    const rpcMethodName = this.getRpcMethodName(signingMethod);
    let deeplinkUrl = '';

    switch (signingMethod) {
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_AND_SEND_TRANSACTION: {
        const typedParams = requestParams as SignTransactionRequestParams;
        if (!typedParams || typeof typedParams.transaction !== 'string') {
          throw new Error(
            `Missing or invalid 'transaction' (base58 string) in params for ${signingMethod}`
          );
        }

        const dataToEncrypt = {
          session: this.sessionToken,
          transaction: typedParams.transaction
        };
        const encryptedData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58
        );
        if (!encryptedData) {
          throw new Error(
            `${this.config.type} provider: Failed to encrypt payload for ${signingMethod}.`
          );
        }

        const signTxDeeplinkParams: DeeplinkSignTransactionParams = {
          dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
          redirect_link: this.config.appScheme,
          cluster: this.currentCluster,
          payload: encryptedData.encryptedPayload,
          nonce: encryptedData.nonce
        };
        deeplinkUrl = this.buildUrl(rpcMethodName, signTxDeeplinkParams as any);
        break;
      }
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE: {
        const typedParams = requestParams as SignMessageRequestParams;
        if (!typedParams || typeof typedParams.message === 'undefined') {
          throw new Error(
            `${this.config.type} provider: Missing 'message' in params for ${signingMethod}`
          );
        }

        let messageBs58: string;
        if (typedParams.message instanceof Uint8Array) {
          messageBs58 = bs58.encode(typedParams.message);
        } else if (typeof typedParams.message === 'string') {
          try {
            bs58.decode(typedParams.message);
            messageBs58 = typedParams.message;
          } catch (e) {
            messageBs58 = bs58.encode(Buffer.from(typedParams.message));
          }
        } else {
          throw new Error(
            `${this.config.type} provider: Invalid message format for signMessage. Expected Uint8Array or string.`
          );
        }

        const dataToEncrypt = {
          message: messageBs58,
          session: this.sessionToken,
          display: typedParams.display || 'utf8'
        };

        const encryptedPayloadData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58
        );

        if (!encryptedPayloadData) {
          throw new Error(
            `${this.config.type} provider: Failed to encrypt payload for signMessage.`
          );
        }

        const signMsgDeeplinkQueryPayload: DeeplinkSignMessageParams = {
          dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
          redirect_link: this.config.appScheme,
          payload: encryptedPayloadData.encryptedPayload,
          nonce: encryptedPayloadData.nonce
        };
        deeplinkUrl = this.buildUrl(rpcMethodName, signMsgDeeplinkQueryPayload as any);
        break;
      }
      case SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS: {
        const typedParams = requestParams as SignAllTransactionsRequestParams;
        if (
          !typedParams ||
          !Array.isArray(typedParams.transactions) ||
          !typedParams.transactions.every((t: any) => typeof t === 'string')
        ) {
          throw new Error(
            `${this.config.type} provider: Missing or invalid 'transactions' (array of base58 strings) in params for ${signingMethod}`
          );
        }

        const dataToEncrypt = {
          session: this.sessionToken,
          transactions: typedParams.transactions
        };
        const encryptedData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58
        );
        if (!encryptedData) {
          throw new Error(
            `${this.config.type} provider: Failed to encrypt payload for ${signingMethod}.`
          );
        }

        const signAllTxDeeplinkParams: DeeplinkSignAllTransactionsParams = {
          dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
          redirect_link: this.config.appScheme,
          cluster: this.currentCluster,
          payload: encryptedData.encryptedPayload,
          nonce: encryptedData.nonce
        };
        deeplinkUrl = this.buildUrl(rpcMethodName, signAllTxDeeplinkParams as any);
        break;
      }
      default: {
        throw new Error(`${this.config.type} provider: Unhandled signing method: ${signingMethod}`);
      }
    }

    return this.openDeeplinkAndWait<T>(
      deeplinkUrl,
      (responseUrlParams: URLSearchParams) => {
        const responseNonce = responseUrlParams.get('nonce');
        const responseData = responseUrlParams.get('data');
        if (!responseNonce || !responseData) {
          throw new Error(
            `${this.config.type} provider: ${signingMethod}: Invalid response - missing nonce or data.`
          );
        }
        const decryptedResult = this.decryptPayload<any>(
          responseData,
          responseNonce,
          this.walletEncryptionPublicKeyBs58!
        );
        if (!decryptedResult) {
          throw new Error(
            `${this.config.type} provider: ${signingMethod}: Failed to decrypt response or invalid decrypted data.`
          );
        }

        return decryptedResult as T;
      },
      signingMethod
    );
  }
}

type Values<T> = T[keyof T];
