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
  SolanaDeeplinkProviderConfig,
  SolanaConnectResult,
  SolanaWalletSession,
  DecryptedConnectData,
  SolanaDeeplinkResponse,
  SignAllTransactionsRequestParams,
  SignMessageRequestParams,
  SignTransactionRequestParams,
  SolanaRpcMethod,
  SolanaConnectParams,
  SolanaDisconnectParams,
  SolanaSignTransactionParams,
  SolanaSignMessageParams,
  SolanaSignAllTransactionsParams,
  SolanaCluster
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

export class SolanaDeeplinkProvider extends EventEmitter implements Provider {
  private readonly config: SolanaDeeplinkProviderConfig;
  private dappEncryptionKeyPair: nacl.BoxKeyPair;
  private currentCluster: SolanaCluster = 'mainnet-beta';

  private storage: Storage;

  private sessionToken: string | null = null;
  private userPublicKey: string | null = null;
  private walletEncryptionPublicKeyBs58: string | null = null;

  constructor(config: SolanaDeeplinkProviderConfig) {
    super();
    this.config = config;
    this.dappEncryptionKeyPair = config.dappEncryptionKeyPair;
    this.storage = config.storage;
  }

  private getStorageKey(): string {
    return `@appkit/${this.config.walletType}-provider-session`;
  }

  getUserPublicKey(): string | null {
    return this.userPublicKey;
  }

  isConnected(): boolean {
    return !!this.sessionToken && !!this.userPublicKey && !!this.dappEncryptionKeyPair;
  }

  private buildUrl(rpcMethod: SolanaRpcMethod, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();

    return `${this.config.baseUrl}/${rpcMethod}?${query}`;
  }

  private getRpcMethodName(method: SolanaSigningMethod): SolanaRpcMethod {
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
    walletPublicKeyBs58ToEncryptFor: string
  ): { nonce: string; encryptedPayload: string } | null {
    if (!walletPublicKeyBs58ToEncryptFor) {
      return null;
    }
    try {
      const walletPublicKeyBytes = bs58.decode(walletPublicKeyBs58ToEncryptFor);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
      const encryptedPayload = nacl.box(
        payloadBytes,
        nonce,
        walletPublicKeyBytes,
        this.dappEncryptionKeyPair.secretKey
      );

      return {
        nonce: bs58.encode(nonce),
        encryptedPayload: bs58.encode(encryptedPayload)
      };
    } catch (error) {
      return null;
    }
  }

  private decryptPayload<T>(
    encryptedDataBs58: string,
    nonceBs58: string,
    walletSenderPublicKeyBs58: string
  ): T | null {
    try {
      // Clean the encrypted data by removing any trailing non-base58 characters (like #)
      const cleanedEncryptedData = encryptedDataBs58.replace(/[^A-Za-z0-9]/g, '');

      const encryptedDataBytes = bs58.decode(cleanedEncryptedData);
      const nonceBytes = bs58.decode(nonceBs58);
      const walletSenderPublicKeyBytes = bs58.decode(walletSenderPublicKeyBs58);
      const decryptedPayloadBytes = nacl.box.open(
        encryptedDataBytes,
        nonceBytes,
        walletSenderPublicKeyBytes,
        this.dappEncryptionKeyPair.secretKey
      );
      if (!decryptedPayloadBytes) {
        return null;
      }

      return JSON.parse(Buffer.from(decryptedPayloadBytes).toString('utf8')) as T;
    } catch (error) {
      return null;
    }
  }

  public async restoreSession(): Promise<boolean> {
    try {
      const session = await this.storage.getItem<SolanaWalletSession>(this.getStorageKey());
      if (session) {
        this.setSession(session);

        return true;
      }

      return false;
    } catch (error) {
      // console.error(`${this.config.walletType}Provider: Failed to restore session.`, error);
      await this.clearSessionStorage(); // Clear potentially corrupt data

      return false;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.sessionToken || !this.userPublicKey || !this.walletEncryptionPublicKeyBs58) {
      return; // Cannot save incomplete session
    }
    const session: SolanaWalletSession = {
      sessionToken: this.sessionToken,
      userPublicKey: this.userPublicKey,
      walletEncryptionPublicKeyBs58: this.walletEncryptionPublicKeyBs58,
      cluster: this.currentCluster
    };
    try {
      await this.storage.setItem(this.getStorageKey(), session);
    } catch (error) {
      // console.error(`${this.config.walletType}Provider: Failed to save session.`, error);
    }
  }

  private async clearSessionStorage(): Promise<void> {
    try {
      await this.storage.removeItem(this.getStorageKey());
    } catch (error) {
      // console.error(`${this.config.walletType}Provider: Failed to clear session storage.`, error);
    }
  }

  public async connect<T = SolanaConnectResult>(params?: { cluster?: SolanaCluster }): Promise<T> {
    const cluster = params?.cluster ?? 'mainnet-beta';
    this.currentCluster = cluster;
    const connectDeeplinkParams: SolanaConnectParams = {
      app_url: this.config.dappUrl,
      dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
      redirect_link: this.config.appScheme,
      cluster
    };
    const url = this.buildUrl('connect', connectDeeplinkParams as any);

    return new Promise<SolanaConnectResult>((resolve, reject) => {
      let subscription: { remove: () => void } | null = null;
      const handleDeepLink = async (event: { url: string }) => {
        if (subscription) {
          subscription.remove();
        }
        const fullUrl = event.url;
        if (fullUrl.startsWith(this.config.appScheme)) {
          const responseUrlParams = new URLSearchParams(
            fullUrl.substring(fullUrl.indexOf('?') + 1)
          );
          const errorCode = responseUrlParams.get('errorCode');
          const errorMessage = responseUrlParams.get('errorMessage');
          if (errorCode) {
            return reject(
              new Error(
                `${this.config.walletType} Connection Failed: ${
                  errorMessage || 'Unknown error'
                } (Code: ${errorCode})`
              )
            );
          }
          const walletEncryptionPublicKey = responseUrlParams.get(
            this.config.encryptionKeyFieldName
          );

          const responsePayload: SolanaDeeplinkResponse = {
            wallet_encryption_public_key: walletEncryptionPublicKey!,
            nonce: responseUrlParams.get('nonce')!,
            data: responseUrlParams.get('data')!
          };
          if (
            !responsePayload.wallet_encryption_public_key ||
            !responsePayload.nonce ||
            !responsePayload.data
          ) {
            return reject(
              new Error(`${this.config.walletType} Connect: Invalid response - missing parameters.`)
            );
          }
          const decryptedData = this.decryptPayload<DecryptedConnectData>(
            responsePayload.data,
            responsePayload.nonce,
            responsePayload.wallet_encryption_public_key
          );
          if (!decryptedData || !decryptedData.public_key || !decryptedData.session) {
            return reject(
              new Error(
                `${this.config.walletType} Connect: Failed to decrypt or invalid decrypted data.`
              )
            );
          }
          this.userPublicKey = decryptedData.public_key;
          this.sessionToken = decryptedData.session;
          this.walletEncryptionPublicKeyBs58 = responsePayload.wallet_encryption_public_key;

          // Save session on successful connect
          this.saveSession();

          resolve({
            userPublicKey: this.userPublicKey,
            sessionToken: this.sessionToken,
            walletEncryptionPublicKeyBs58: this.walletEncryptionPublicKeyBs58,
            cluster
          });
        } else {
          reject(new Error(`${this.config.walletType} Connect: Unexpected redirect URI.`));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(url).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        reject(
          new Error(
            `Failed to open ${this.config.walletType} wallet: ${err.message}. Is it installed?`
          )
        );
      });
    }) as Promise<T>;
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
      // console.warn(`${this.config.walletType}Provider: Failed to encrypt disconnect payload. Clearing session locally.`);
      await this.clearSession();
      this.emit('disconnect');

      return Promise.resolve(); // Or reject, depending on desired strictness
    }

    const disconnectDeeplinkParams: SolanaDisconnectParams = {
      dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
      redirect_link: this.config.appScheme,
      payload: encryptedDisconnectPayload.encryptedPayload,
      nonce: encryptedDisconnectPayload.nonce
    };
    const url = this.buildUrl('disconnect', disconnectDeeplinkParams as any);

    return new Promise<void>((resolve, reject) => {
      let subscription: { remove: () => void } | null = null;
      const handleDeepLink = (event: { url: string }) => {
        if (subscription) {
          subscription.remove();
        }
        if (event.url.startsWith(this.config.appScheme)) {
          this.clearSession();
          resolve();
        } else {
          this.clearSession();
          reject(new Error(`${this.config.walletType} Disconnect: Unexpected redirect URI.`));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(url).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        this.clearSession();
        reject(
          new Error(`Failed to open ${this.config.walletType} for disconnection: ${err.message}.`)
        );
      });
    });
  }

  public async clearSession(): Promise<void> {
    this.sessionToken = null;
    this.userPublicKey = null;
    this.walletEncryptionPublicKeyBs58 = null;
    await this.clearSessionStorage();
  }

  public setSession(session: SolanaWalletSession): void {
    this.sessionToken = session.sessionToken;
    this.userPublicKey = session.userPublicKey;
    this.walletEncryptionPublicKeyBs58 = session.walletEncryptionPublicKeyBs58;
    this.currentCluster = session.cluster;
  }

  public async request<T>(args: RequestArguments, _chainId?: CaipNetworkId): Promise<T> {
    if (!isValidSolanaSigningMethod(args.method)) {
      throw new Error(
        `${this.config.walletType}Provider: Unsupported method: ${args.method}. Only Solana signing methods are supported.`
      );
    }
    const signingMethod = args.method as SolanaSigningMethod;
    const requestParams = args.params as any;

    if (!this.isConnected() || !this.sessionToken || !this.walletEncryptionPublicKeyBs58) {
      throw new Error(
        `${this.config.walletType}Provider: Not connected or session details missing. Cannot process request.`
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
          session: this.sessionToken!,
          transaction: typedParams.transaction
        };
        const encryptedData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58!
        );
        if (!encryptedData) {
          throw new Error(
            `${this.config.walletType}Provider: Failed to encrypt payload for ${signingMethod}.`
          );
        }

        const signTxDeeplinkParams: SolanaSignTransactionParams = {
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
          throw new Error(`Missing 'message' in params for ${signingMethod}`);
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
          throw new Error('Invalid message format for signMessage. Expected Uint8Array or string.');
        }

        const dataToEncrypt = {
          message: messageBs58,
          session: this.sessionToken!,
          display: typedParams.display || 'utf8'
        };

        const encryptedPayloadData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58!
        );

        if (!encryptedPayloadData) {
          throw new Error(
            `${this.config.walletType}Provider: Failed to encrypt payload for signMessage.`
          );
        }

        const signMsgDeeplinkQueryPayload: SolanaSignMessageParams = {
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
            `Missing or invalid 'transactions' (array of base58 strings) in params for ${signingMethod}`
          );
        }

        const dataToEncrypt = {
          session: this.sessionToken!,
          transactions: typedParams.transactions
        };
        const encryptedData = this.encryptPayload(
          dataToEncrypt,
          this.walletEncryptionPublicKeyBs58!
        );
        if (!encryptedData) {
          throw new Error(
            `${this.config.walletType}Provider: Failed to encrypt payload for ${signingMethod}.`
          );
        }

        const signAllTxDeeplinkParams: SolanaSignAllTransactionsParams = {
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
        throw new Error(
          `${this.config.walletType}Provider: Unhandled signing method: ${signingMethod}`
        );
      }
    }

    return new Promise<T>((resolve, reject) => {
      let subscription: { remove: () => void } | null = null;
      const handleDeepLink = async (event: { url: string }) => {
        if (subscription) {
          subscription.remove();
        }
        const fullUrl = event.url;
        if (fullUrl.startsWith(this.config.appScheme)) {
          const responseUrlParams = new URLSearchParams(
            fullUrl.substring(fullUrl.indexOf('?') + 1)
          );
          const errorCode = responseUrlParams.get('errorCode');
          const errorMessage = responseUrlParams.get('errorMessage');
          if (errorCode) {
            return reject(
              new Error(
                `${this.config.walletType} ${signingMethod} Failed: ${
                  errorMessage || 'Unknown error'
                } (Code: ${errorCode})`
              )
            );
          }
          const responseNonce = responseUrlParams.get('nonce');
          const responseData = responseUrlParams.get('data');
          if (!responseNonce || !responseData) {
            return reject(
              new Error(
                `${this.config.walletType} ${signingMethod}: Invalid response - missing nonce or data.`
              )
            );
          }
          const decryptedResult = this.decryptPayload<any>(
            responseData,
            responseNonce,
            this.walletEncryptionPublicKeyBs58!
          );
          if (!decryptedResult) {
            return reject(
              new Error(
                `${this.config.walletType} ${signingMethod}: Failed to decrypt response or invalid decrypted data.`
              )
            );
          }
          resolve(decryptedResult as T);
        } else {
          reject(new Error(`${this.config.walletType} ${signingMethod}: Unexpected redirect URI.`));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(deeplinkUrl).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        reject(
          new Error(
            `Failed to open ${this.config.walletType} for ${signingMethod}: ${err.message}. Is it installed?`
          )
        );
      });
    });
  }
}

type Values<T> = T[keyof T];
