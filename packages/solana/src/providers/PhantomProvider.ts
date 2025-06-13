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
  PhantomProviderConfig,
  PhantomConnectResult,
  PhantomSession,
  DecryptedConnectData,
  PhantomDeeplinkResponse,
  SignAllTransactionsRequestParams,
  SignMessageRequestParams,
  SignTransactionRequestParams,
  PhantomRpcMethod,
  PhantomConnectParams,
  PhantomDisconnectParams,
  PhantomSignTransactionParams,
  PhantomSignMessageParams,
  PhantomSignAllTransactionsParams,
  PhantomCluster
} from '../types';
import EventEmitter from 'events';

const PHANTOM_BASE_URL = 'https://phantom.app/ul/v1';
const PHANTOM_PROVIDER_STORAGE_KEY = '@appkit/phantom-provider-session';

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

export class PhantomProvider extends EventEmitter implements Provider {
  private readonly config: PhantomProviderConfig;
  private dappEncryptionKeyPair: nacl.BoxKeyPair;
  private currentCluster: PhantomCluster = 'mainnet-beta';

  private storage: Storage;

  private sessionToken: string | null = null;
  private userPublicKey: string | null = null;
  private phantomEncryptionPublicKeyBs58: string | null = null;

  constructor(config: PhantomProviderConfig) {
    super();
    this.config = config;
    this.dappEncryptionKeyPair = config.dappEncryptionKeyPair;
    this.storage = config.storage;
  }

  getUserPublicKey(): string | null {
    return this.userPublicKey;
  }

  isConnected(): boolean {
    return !!this.sessionToken && !!this.userPublicKey && !!this.dappEncryptionKeyPair;
  }

  private buildUrl(rpcMethod: PhantomRpcMethod, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();

    return `${PHANTOM_BASE_URL}/${rpcMethod}?${query}`;
  }

  private getRpcMethodName(method: SolanaSigningMethod): PhantomRpcMethod {
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
    phantomPublicKeyBs58ToEncryptFor: string
  ): { nonce: string; encryptedPayload: string } | null {
    if (!phantomPublicKeyBs58ToEncryptFor) {
      return null;
    }
    try {
      const phantomPublicKeyBytes = bs58.decode(phantomPublicKeyBs58ToEncryptFor);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8');
      const encryptedPayload = nacl.box(
        payloadBytes,
        nonce,
        phantomPublicKeyBytes,
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
    phantomSenderPublicKeyBs58: string
  ): T | null {
    try {
      const encryptedDataBytes = bs58.decode(encryptedDataBs58);
      const nonceBytes = bs58.decode(nonceBs58);
      const phantomSenderPublicKeyBytes = bs58.decode(phantomSenderPublicKeyBs58);
      const decryptedPayloadBytes = nacl.box.open(
        encryptedDataBytes,
        nonceBytes,
        phantomSenderPublicKeyBytes,
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
      const session = await this.storage.getItem<PhantomSession>(PHANTOM_PROVIDER_STORAGE_KEY);
      if (session) {
        this.setSession(session);

        return true;
      }

      return false;
    } catch (error) {
      // console.error('PhantomProvider: Failed to restore session.', error);
      await this.clearSessionStorage(); // Clear potentially corrupt data

      return false;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.sessionToken || !this.userPublicKey || !this.phantomEncryptionPublicKeyBs58) {
      return; // Cannot save incomplete session
    }
    const session: PhantomSession = {
      sessionToken: this.sessionToken,
      userPublicKey: this.userPublicKey,
      phantomEncryptionPublicKeyBs58: this.phantomEncryptionPublicKeyBs58,
      cluster: this.currentCluster
    };
    try {
      await this.storage.setItem(PHANTOM_PROVIDER_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      // console.error('PhantomProvider: Failed to save session.', error);
    }
  }

  private async clearSessionStorage(): Promise<void> {
    try {
      await this.storage.removeItem(PHANTOM_PROVIDER_STORAGE_KEY);
    } catch (error) {
      // console.error('PhantomProvider: Failed to clear session storage.', error);
    }
  }

  public async connect<T = PhantomConnectResult>(params?: {
    cluster?: PhantomCluster;
  }): Promise<T> {
    const cluster = params?.cluster ?? 'mainnet-beta';
    this.currentCluster = cluster;
    const connectDeeplinkParams: PhantomConnectParams = {
      app_url: this.config.dappUrl,
      dapp_encryption_public_key: bs58.encode(this.dappEncryptionKeyPair.publicKey),
      redirect_link: this.config.appScheme,
      cluster
    };
    const url = this.buildUrl('connect', connectDeeplinkParams as any);

    return new Promise<PhantomConnectResult>((resolve, reject) => {
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
                `Phantom Connection Failed: ${errorMessage || 'Unknown error'} (Code: ${errorCode})`
              )
            );
          }
          const responsePayload: PhantomDeeplinkResponse = {
            phantom_encryption_public_key: responseUrlParams.get('phantom_encryption_public_key')!,
            nonce: responseUrlParams.get('nonce')!,
            data: responseUrlParams.get('data')!
          };
          if (
            !responsePayload.phantom_encryption_public_key ||
            !responsePayload.nonce ||
            !responsePayload.data
          ) {
            return reject(new Error('Phantom Connect: Invalid response - missing parameters.'));
          }
          const decryptedData = this.decryptPayload<DecryptedConnectData>(
            responsePayload.data,
            responsePayload.nonce,
            responsePayload.phantom_encryption_public_key
          );
          if (!decryptedData || !decryptedData.public_key || !decryptedData.session) {
            return reject(
              new Error('Phantom Connect: Failed to decrypt or invalid decrypted data.')
            );
          }
          this.userPublicKey = decryptedData.public_key;
          this.sessionToken = decryptedData.session;
          this.phantomEncryptionPublicKeyBs58 = responsePayload.phantom_encryption_public_key;

          // Save session on successful connect
          this.saveSession();

          resolve({
            userPublicKey: this.userPublicKey,
            sessionToken: this.sessionToken,
            phantomEncryptionPublicKeyBs58: this.phantomEncryptionPublicKeyBs58,
            cluster
          });
        } else {
          reject(new Error('Phantom Connect: Unexpected redirect URI.'));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(url).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        reject(new Error(`Failed to open Phantom wallet: ${err.message}. Is it installed?`));
      });
    }) as Promise<T>;
  }

  public async disconnect(): Promise<void> {
    if (!this.sessionToken || !this.phantomEncryptionPublicKeyBs58) {
      await this.clearSession();

      return Promise.resolve();
    }

    const payloadToEncrypt = { session: this.sessionToken };
    const encryptedDisconnectPayload = this.encryptPayload(
      payloadToEncrypt,
      this.phantomEncryptionPublicKeyBs58
    );

    if (!encryptedDisconnectPayload) {
      // console.warn('PhantomProvider: Failed to encrypt disconnect payload. Clearing session locally.');
      await this.clearSession();

      return Promise.resolve(); // Or reject, depending on desired strictness
    }

    const disconnectDeeplinkParams: PhantomDisconnectParams = {
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
          reject(new Error('Phantom Disconnect: Unexpected redirect URI.'));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(url).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        this.clearSession();
        reject(new Error(`Failed to open Phantom for disconnection: ${err.message}.`));
      });
    });
  }

  public async clearSession(): Promise<void> {
    this.sessionToken = null;
    this.userPublicKey = null;
    this.phantomEncryptionPublicKeyBs58 = null;
    await this.clearSessionStorage();
  }

  public setSession(session: PhantomSession): void {
    this.sessionToken = session.sessionToken;
    this.userPublicKey = session.userPublicKey;
    this.phantomEncryptionPublicKeyBs58 = session.phantomEncryptionPublicKeyBs58;
    this.currentCluster = session.cluster;
  }

  public async request<T>(args: RequestArguments, _chainId?: CaipNetworkId): Promise<T> {
    if (!isValidSolanaSigningMethod(args.method)) {
      throw new Error(
        `PhantomProvider: Unsupported method: ${args.method}. Only Solana signing methods are supported.`
      );
    }
    const signingMethod = args.method as SolanaSigningMethod;
    const requestParams = args.params as any;

    if (!this.isConnected() || !this.sessionToken || !this.phantomEncryptionPublicKeyBs58) {
      throw new Error(
        'PhantomProvider: Not connected or session details missing. Cannot process request.'
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
          this.phantomEncryptionPublicKeyBs58!
        );
        if (!encryptedData) {
          throw new Error(`PhantomProvider: Failed to encrypt payload for ${signingMethod}.`);
        }

        const signTxDeeplinkParams: PhantomSignTransactionParams = {
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
          this.phantomEncryptionPublicKeyBs58!
        );

        if (!encryptedPayloadData) {
          throw new Error('PhantomProvider: Failed to encrypt payload for signMessage.');
        }

        const signMsgDeeplinkQueryPayload: PhantomSignMessageParams = {
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
          this.phantomEncryptionPublicKeyBs58!
        );
        if (!encryptedData) {
          throw new Error(`PhantomProvider: Failed to encrypt payload for ${signingMethod}.`);
        }

        const signAllTxDeeplinkParams: PhantomSignAllTransactionsParams = {
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
        throw new Error(`PhantomProvider: Unhandled signing method: ${signingMethod}`);
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
                `Phantom ${signingMethod} Failed: ${
                  errorMessage || 'Unknown error'
                } (Code: ${errorCode})`
              )
            );
          }
          const responseNonce = responseUrlParams.get('nonce');
          const responseData = responseUrlParams.get('data');
          if (!responseNonce || !responseData) {
            return reject(
              new Error(`Phantom ${signingMethod}: Invalid response - missing nonce or data.`)
            );
          }
          const decryptedResult = this.decryptPayload<any>(
            responseData,
            responseNonce,
            this.phantomEncryptionPublicKeyBs58!
          );
          if (!decryptedResult) {
            return reject(
              new Error(
                `Phantom ${signingMethod}: Failed to decrypt response or invalid decrypted data.`
              )
            );
          }
          resolve(decryptedResult as T);
        } else {
          reject(new Error(`Phantom ${signingMethod}: Unexpected redirect URI.`));
        }
      };
      subscription = Linking.addEventListener('url', handleDeepLink);
      Linking.openURL(deeplinkUrl).catch(err => {
        if (subscription) {
          subscription.remove();
        }
        reject(
          new Error(`Failed to open Phantom for ${signingMethod}: ${err.message}. Is it installed?`)
        );
      });
    });
  }
}

type Values<T> = T[keyof T];
