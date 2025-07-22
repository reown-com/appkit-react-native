import EventEmitter from 'events';
import type { Provider, RequestArguments } from '@reown/appkit-common-react-native';
import { configure, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import { isValidMethod } from '../utils';
import type { CoinbaseProviderConfig } from '../types';

export class CoinbaseProvider extends EventEmitter implements Provider {
  private readonly config: CoinbaseProviderConfig;
  private provider: WalletMobileSDKEVMProvider;

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
      jsonRpcUrl: this.config.rpcUrl,
      chainId: this.config.defaultChain,
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

      //TODO: check switch chain

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
    if (!isValidMethod(args.method)) {
      throw new Error(`CoinbaseProvider: Invalid method: ${args.method}`);
    }

    return this.provider.request(args);
  }

  getChainId(): `0x${string}` {
    return this.provider.chainId as `0x${string}`;
  }

  override on(event: string, listener: (args?: any) => void): any {
    return this.provider.on(event, listener);
  }

  override off(event: string, listener: (args?: any) => void): any {
    return this.provider.off(event, listener);
  }
}
