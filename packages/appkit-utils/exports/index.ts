import type UniversalProvider from '@walletconnect/universal-provider';
export { ConstantsUtil } from '../src/ConstantsUtil';
export { PresetsUtil } from '../src/PresetsUtil';
export { HelpersUtil } from '../src/HelpersUtil';
export { ErrorUtil } from '../src/ErrorUtil';
export { LoggerUtil } from '../src/LoggerUtil';
export { CaipNetworksUtil } from '../src/CaipNetworkUtil';
export type { SocialProvider } from '../src/TypeUtil';
import type { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';

export { SocialProviderEnum } from '../src/TypeUtil';

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

type ProviderEventListener = {
  connect: (connectParams: { chainId: number }) => void;
  disconnect: (error: Error) => void;
  chainChanged: (chainId: string) => void;
  accountsChanged: (accounts: string[]) => void;
  message: (message: { type: string; data: unknown }) => void;
};

export interface Provider {
  request: <T>(args: RequestArguments) => Promise<T>;
  on<T extends keyof ProviderEventListener>(event: T, listener: ProviderEventListener[T]): void;
  removeListener: <T>(event: string, listener: (data: T) => void) => void;
  emit: (event: string) => void;
}

export type UniversalProviderType = UniversalProvider & AppKitFrameProvider & Provider;
