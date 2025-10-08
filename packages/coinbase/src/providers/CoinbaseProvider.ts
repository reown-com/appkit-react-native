import EventEmitter from 'events';
import {
  type Provider,
  type RequestArguments,
  StringUtil
} from '@reown/appkit-common-react-native';
import { configure, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import type { CoinbaseProviderConfig } from '../types';

export class CoinbaseProvider extends EventEmitter implements Provider {
  private readonly config: CoinbaseProviderConfig;
  private provider: WalletMobileSDKEVMProvider;
  private chainChangedListeners = new Map<
    (args?: any) => void,
    (hexChainId: `0x${string}`) => void
  >();

  constructor(config: CoinbaseProviderConfig) {
    super();
    this.config = config;
    configure({
      hostURL: new URL('https://wallet.coinbase.com/wsegue'),
      callbackURL: new URL(this.config.redirect), // App Universal Link
      hostPackageName: 'org.toshi'
    });
    this.provider = new WalletMobileSDKEVMProvider({
      ...this.config,
      jsonRpcUrl: this.config.jsonRpcUrl,
      storage: this.config.storage
    });
  }

  async connect<T = string[]>(): Promise<T> {
    try {
      let accounts: string[] = [];
      const isConnected = this.provider.connected;

      if (!isConnected) {
        accounts = await this.provider.request({
          method: 'eth_requestAccounts',
          params: []
        });
      } else {
        accounts = this.provider.selectedAddress ? [this.provider.selectedAddress] : [];
      }

      return accounts as T;
    } catch (error) {
      console.warn('CoinbaseProvider: connect error', error);

      throw error;
    }
  }
  async disconnect(): Promise<void> {
    this.provider.disconnect();

    return Promise.resolve();
  }

  request<T = unknown>(args: RequestArguments): Promise<T> {
    return this.provider.request(args);
  }

  getChainId(): `0x${string}` {
    return this.provider.chainId as `0x${string}`;
  }

  onChainChanged(hexChainId: `0x${string}`): void {
    const chainId = StringUtil.hexToString(hexChainId);
    this.emit('chainChanged', { chainId });
  }

  override on(event: string, listener: (args?: any) => void): any {
    if (event === 'chainChanged') {
      // Create middleware that formats the chain ID before calling the original listener
      const chainChangedMiddleware = (hexChainId: `0x${string}`) => {
        const chainId = StringUtil.hexToString(hexChainId);
        listener(chainId);
      };

      // Store the mapping between original listener and middleware
      this.chainChangedListeners.set(listener, chainChangedMiddleware);

      return this.provider.on('chainChanged', chainChangedMiddleware);
    }

    return this.provider.on(event, listener);
  }

  override off(event: string, listener: (args?: any) => void): any {
    if (event === 'chainChanged') {
      // Get the middleware wrapper for this listener
      const middleware = this.chainChangedListeners.get(listener);
      if (middleware) {
        // Remove the middleware from the provider
        this.provider.off('chainChanged', middleware);
        // Remove the mapping
        this.chainChangedListeners.delete(listener);

        return this;
      }
    }

    return this.provider.off(event, listener);
  }
}
