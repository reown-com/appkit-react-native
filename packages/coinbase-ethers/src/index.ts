import { configure, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import type { WalletMobileSDKProviderOptions } from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

type CoinbaseProviderOptions = WalletMobileSDKProviderOptions & {
  redirect: string;
  rpcUrl: string;
};

export class CoinbaseProvider {
  readonly id = 'coinbaseWallet';
  readonly name = 'Coinbase Wallet';

  private _provider?: WalletMobileSDKEVMProvider;
  private _initProviderPromise?: Promise<void>;
  private readonly options: CoinbaseProviderOptions;

  constructor(options: CoinbaseProviderOptions) {
    this.options = options;
    this._createProvider();
  }

  public address = async () => {
    return (await this.getProvider()).selectedAddress;
  };

  public emit = (event: string) => {
    this.getProvider().then(provider => provider.emit(event));
  };

  public on = (event: string, listener: (data: any) => void) => {
    this.getProvider().then(provider => provider.on(event, listener));
  };

  public removeListener = (event: string, listener: (data: any) => void) => {
    this.getProvider().then(provider => provider.removeListener(event, listener));
  };

  public request = async <T>(args: RequestArguments): Promise<T> => {
    const provider = await this.getProvider();

    return provider.request(args);
  };

  private async _createProvider() {
    if (!this._initProviderPromise) {
      this._initProviderPromise = this._initProvider();
    }

    return this._initProviderPromise;
  }

  private _initProvider = async () => {
    configure({
      callbackURL: new URL(this.options.redirect),
      hostURL: new URL('https://wallet.coinbase.com/wsegue'), // Don't change -> Coinbase url
      hostPackageName: 'org.toshi' // Don't change -> Coinbase wallet scheme
    });

    this._provider = new WalletMobileSDKEVMProvider({
      ...this.options,
      jsonRpcUrl: this.options.rpcUrl
    });
  };

  public getProvider = async () => {
    if (!this._provider) await this._createProvider();

    return this._provider!;
  };
}
