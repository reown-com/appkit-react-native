import { configure, WalletMobileSDKEVMProvider } from '@coinbase/wallet-mobile-sdk';
import type { WalletMobileSDKProviderOptions } from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';

import type { RequestArguments } from '@web3modal/scaffold-utils-react-native';

type CoinbaseEthers5ProviderOptions = WalletMobileSDKProviderOptions & {
  redirect: string;
};

export class CoinbaseEthers5Provider {
  private _provider?: WalletMobileSDKEVMProvider;
  private _initProviderPromise?: Promise<void>;
  private readonly options: CoinbaseEthers5ProviderOptions;

  constructor(config: { options: CoinbaseEthers5ProviderOptions }) {
    this.options = config.options;
    this._createProvider();
  }

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

    this._provider = new WalletMobileSDKEVMProvider({ ...this.options });
  };

  public getProvider = async () => {
    if (!this._provider) await this._createProvider();
    // if (chainId) await this.switchChain(chainId);

    return this._provider!;
  };
}
