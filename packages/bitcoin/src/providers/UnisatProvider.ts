import { Linking } from 'react-native';
import EventEmitter from 'events';
import type {
  Provider,
  RequestArguments,
  CaipNetworkId,
  Storage
} from '@reown/appkit-common-react-native';

export const BITCOIN_SIGNING_METHODS = {
  BITCOIN_SIGN_MESSAGE: 'signMessage',
  BITCOIN_SIGN_PSBT: 'signPsbt',
  BITCOIN_SWITCH_CHAIN: 'switchChain'
} as const;

// Map of method names that the app might call to the actual UniSat methods
const METHOD_NAME_MAP: Record<string, BitcoinSigningMethod> = {
  signPsbt: BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_PSBT,
  signMessage: BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_MESSAGE,
  switchChain: BITCOIN_SIGNING_METHODS.BITCOIN_SWITCH_CHAIN
};

type BitcoinSigningMethod = (typeof BITCOIN_SIGNING_METHODS)[keyof typeof BITCOIN_SIGNING_METHODS];

export type UnisatChain =
  | 'BITCOIN_MAINNET'
  | 'BITCOIN_TESTNET'
  | 'BITCOIN_TESTNET4'
  | 'BITCOIN_SIGNET'
  | 'FRACTAL_BITCOIN_MAINNET'
  | 'FRACTAL_BITCOIN_TESTNET';

export interface UnisatProviderConfig {
  appScheme: string;
  appName: string;
  storage: Storage;
}

export interface UnisatSession {
  address: string;
  publicKey: string;
  chain: UnisatChain;
}

export interface UnisatConnectResult {
  address: string;
  publicKey: string;
  chain: UnisatChain;
}

export interface UnisatSignMessageParams {
  message: string;
  type?: 'ecdsa' | 'bip322-simple';
}

export interface UnisatSignPsbtParams {
  psbtHex: string;
  options?: {
    autoFinalized?: boolean;
    toSignInputs?: Array<{
      index: number;
      address?: string;
      publicKey?: string;
      sighashTypes?: number[];
      disableTweakSigner?: boolean;
    }>;
  };
}

const UNISAT_PROVIDER_STORAGE_KEY = '@appkit/unisat-provider-session';

export class UnisatProvider extends EventEmitter implements Provider {
  private readonly config: UnisatProviderConfig;
  private storage: Storage;
  private session: UnisatSession | null = null;

  // Single subscription management - deep links are sequential by nature
  private activeSubscription: { remove: () => void } | null = null;
  private isOperationPending = false;

  constructor(config: UnisatProviderConfig) {
    super();
    this.config = config;
    this.storage = config.storage;
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

  getUserAddress(): string | null {
    return this.session?.address || null;
  }

  getUserPublicKey(): string | null {
    return this.session?.publicKey || null;
  }

  getCurrentChain(): UnisatChain | null {
    return this.session?.chain || null;
  }

  isConnected(): boolean {
    return !!this.session?.address && !!this.session?.publicKey;
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private buildConnectUrl(): string {
    const nonce = this.generateNonce();
    const params = new URLSearchParams({
      method: 'connect',
      from: this.config.appScheme,
      nonce
    });

    return `unisat://request?${params.toString()}`;
  }

  private buildSwitchChainUrl(chain: UnisatChain): string {
    const nonce = this.generateNonce();
    const data = Buffer.from(JSON.stringify([chain])).toString('base64');
    const params = new URLSearchParams({
      method: 'switchChain',
      data,
      from: this.config.appScheme,
      nonce
    });

    return `unisat://request?${params.toString()}`;
  }

  private buildSignMessageUrl(text: string, type: 'ecdsa' | 'bip322-simple' = 'ecdsa'): string {
    const nonce = this.generateNonce();
    const data = Buffer.from(JSON.stringify([text, type])).toString('base64');
    const params = new URLSearchParams({
      method: 'signMessage',
      data,
      from: this.config.appScheme,
      nonce
    });

    return `unisat://request?${params.toString()}`;
  }

  private buildSignPsbtUrl(psbtHex: string, options?: UnisatSignPsbtParams['options']): string {
    const nonce = this.generateNonce();
    const data = Buffer.from(JSON.stringify([psbtHex, options])).toString('base64');
    const params = new URLSearchParams({
      method: 'signPsbt',
      data,
      from: this.config.appScheme,
      nonce
    });

    return `unisat://request?${params.toString()}`;
  }

  private parseResponse(url: string): { data?: string; error?: string; nonce?: string } {
    try {
      // Handle the unusual format: https://appkit-lab.reown.com/rn_appkit_debug://response?data=...
      // Extract just the query parameters part
      const queryStart = url.indexOf('?');
      if (queryStart === -1) {
        return {};
      }

      const queryString = url.substring(queryStart + 1);
      const params = new URLSearchParams(queryString);

      const data = params.get('data') ?? undefined;
      const error = params.get('error') ?? undefined;
      const nonce = params.get('nonce') ?? undefined;

      return { data, error, nonce };
    } catch (error) {
      // Fallback: try to parse as regular URL
      try {
        const urlObj = new URL(url);
        const data = urlObj.searchParams.get('data') ?? undefined;
        const _error = urlObj.searchParams.get('error') ?? undefined;
        const nonce = urlObj.searchParams.get('nonce') ?? undefined;

        return { data, error: _error, nonce };
      } catch {
        return {};
      }
    }
  }

  private decodeBase64Data<T>(base64Data: string): T | null {
    try {
      const decodedString = Buffer.from(base64Data, 'base64').toString('utf8');

      // Always try to parse as JSON first since UniSat encodes all responses as JSON
      return JSON.parse(decodedString) as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generic method to handle deeplink requests with UniSat wallet
   */
  private async executeDeeplinkRequest<T>(
    url: string,
    operationName: string,
    responseTransformer?: (result: any) => T | Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const handleDeepLink = async (event: { url: string }) => {
        try {
          this.cleanupActiveSubscription();
          const fullUrl = event.url;

          if (
            fullUrl.includes(this.config.appScheme) &&
            (fullUrl.includes('response') ||
              fullUrl.includes('data=') ||
              fullUrl.includes('error='))
          ) {
            const { data, error } = this.parseResponse(fullUrl);

            if (error) {
              // Try to decode as JSON first, then as plain string
              let errorMessage = 'Unknown error';
              try {
                const decodedString = Buffer.from(error, 'base64').toString('utf8');
                try {
                  // Try to parse as JSON
                  const errorData = JSON.parse(decodedString);
                  errorMessage = errorData.message || errorData.toString();
                } catch {
                  // If not JSON, use the decoded string directly
                  errorMessage = decodedString;
                }
              } catch {
                // If base64 decode fails, use the raw error
                errorMessage = error;
              }

              return reject(new Error(`UniSat ${operationName} Failed: ${errorMessage}`));
            }

            if (!data) {
              return reject(new Error(`UniSat ${operationName}: No data received`));
            }

            const result = this.decodeBase64Data<any>(data);
            if (!result) {
              return reject(new Error(`UniSat ${operationName}: Failed to decode response`));
            }

            // Apply transformation if provided, otherwise return result as-is
            const finalResult = responseTransformer ? await responseTransformer(result) : result;
            resolve(finalResult);
          } else {
            reject(new Error(`UniSat ${operationName}: Unexpected redirect URI`));
          }
        } catch (error) {
          this.cleanupActiveSubscription();
          reject(error);
        }
      };

      const subscription = Linking.addEventListener('url', handleDeepLink);
      this.setActiveSubscription(subscription);

      Linking.openURL(url).catch(err => {
        this.cleanupActiveSubscription();
        reject(
          new Error(`Failed to open UniSat for ${operationName}: ${err.message}. Is it installed?`)
        );
      });
    });
  }

  public async restoreSession(): Promise<boolean> {
    try {
      const session = await this.storage.getItem<UnisatSession>(UNISAT_PROVIDER_STORAGE_KEY);
      if (session && session.address && session.publicKey) {
        this.session = session;

        return true;
      }

      return false;
    } catch (error) {
      await this.clearSessionStorage();

      return false;
    }
  }

  private async saveSession(): Promise<void> {
    if (!this.session) {
      return;
    }
    try {
      await this.storage.setItem(UNISAT_PROVIDER_STORAGE_KEY, this.session);
    } catch (error) {
      // Silent fail
    }
  }

  private async clearSessionStorage(): Promise<void> {
    try {
      await this.storage.removeItem(UNISAT_PROVIDER_STORAGE_KEY);
    } catch (error) {
      // Silent fail
    }
  }

  public async connect<T = UnisatConnectResult>(params?: { chain?: UnisatChain }): Promise<T> {
    const url = this.buildConnectUrl();

    const connectTransformer = async (connectData: {
      address: string;
      network: string;
      pubkey: string;
      version: string;
    }): Promise<UnisatConnectResult> => {
      if (!connectData || !connectData.address || !connectData.pubkey) {
        throw new Error('UniSat Connect: Invalid response data');
      }

      // Map UniSat network to our chain format
      let chain: UnisatChain;
      switch (connectData.network) {
        case 'livenet':
          chain = 'BITCOIN_MAINNET';
          break;
        case 'testnet':
          chain = 'BITCOIN_TESTNET';
          break;
        default:
          chain = params?.chain || 'BITCOIN_MAINNET';
      }

      this.session = {
        address: connectData.address,
        publicKey: connectData.pubkey,
        chain
      };

      await this.saveSession();

      return {
        address: this.session.address,
        publicKey: this.session.publicKey,
        chain: this.session.chain
      };
    };

    return this.executeDeeplinkRequest(url, 'Connect', connectTransformer) as Promise<T>;
  }

  public async disconnect(): Promise<void> {
    await this.clearSession();
    this.emit('disconnect');
  }

  public async clearSession(): Promise<void> {
    this.session = null;
    this.cleanupActiveSubscription();
    await this.clearSessionStorage();
  }

  public setSession(session: UnisatSession): void {
    this.session = session;
  }

  public async request<T>(args: RequestArguments, _chainId?: CaipNetworkId): Promise<T> {
    // Map the method name to the actual UniSat method
    const mappedMethod = METHOD_NAME_MAP[args.method];
    if (!mappedMethod) {
      throw new Error(
        `UnisatProvider: Unsupported method: ${args.method}. Only Bitcoin signing methods are supported.`
      );
    }

    if (!this.isConnected()) {
      throw new Error('UnisatProvider: Not connected. Cannot process request.');
    }

    const method = mappedMethod;
    let url = '';

    switch (method) {
      case BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_MESSAGE: {
        const params = args.params as UnisatSignMessageParams;
        if (!params || !params.message) {
          throw new Error('Missing message parameter for bitcoin_signMessage');
        }
        url = this.buildSignMessageUrl(params.message, params.type);
        break;
      }
      case BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_PSBT: {
        const params = args.params as any;
        if (!params || (!params.psbtHex && !params.psbt)) {
          throw new Error('Missing psbtHex or psbt parameter for signPsbt');
        }

        // Handle both parameter formats: psbtHex (UniSat format) and psbt (app format)
        const psbtHex = params.psbtHex || params.psbt;
        const options = params.options || {
          autoFinalized: params.broadcast !== false,
          toSignInputs: params.signInputs
        };

        url = this.buildSignPsbtUrl(psbtHex, options);
        break;
      }
      case BITCOIN_SIGNING_METHODS.BITCOIN_SWITCH_CHAIN: {
        const params = args.params as { chain: UnisatChain };
        if (!params || !params.chain) {
          throw new Error('Missing chain parameter for bitcoin_switchChain');
        }
        url = this.buildSwitchChainUrl(params.chain);
        break;
      }
      default: {
        throw new Error(`UnisatProvider: Unhandled method: ${method}`);
      }
    }

    const requestTransformer = async (result: any): Promise<T> => {
      // Update session chain if switching chain
      if (method === BITCOIN_SIGNING_METHODS.BITCOIN_SWITCH_CHAIN) {
        const params = args.params as { chain: UnisatChain };
        if (this.session) {
          this.session.chain = params.chain;
          await this.saveSession();
        }
      }

      // Transform response based on method
      if (method === BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_MESSAGE) {
        // UniSat returns just the signature string, but app expects { signature: string }
        // Also convert base64 signature to hex format
        const signature = typeof result === 'string' ? result : result.toString();
        const hexSignature = Buffer.from(signature, 'base64').toString('hex');

        return {
          address: this.session?.address || '',
          signature: hexSignature
        } as T;
      } else if (method === BITCOIN_SIGNING_METHODS.BITCOIN_SIGN_PSBT) {
        // UniSat returns signed PSBT, app expects { psbt: string, txid?: string }
        const signedPsbt = typeof result === 'string' ? result : result.toString();

        return {
          psbt: signedPsbt,
          txid: undefined // UniSat doesn't return txid, it's just the signed PSBT
        } as T;
      } else {
        return result as T;
      }
    };

    return this.executeDeeplinkRequest(url, method, requestTransformer);
  }
}
