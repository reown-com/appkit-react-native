import type UniversalProvider from '@walletconnect/universal-provider';
import type { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';
export { ConstantsUtil } from '../ConstantsUtil';
export { PresetsUtil } from '../PresetsUtil';
export { HelpersUtil } from '../HelpersUtil';
export { ErrorUtil } from '../ErrorUtil';
export { LoggerUtil } from '../LoggerUtil';
export { CaipNetworksUtil } from '../CaipNetworkUtil';
export type { SocialProvider } from '../TypeUtil';
export { SocialProviderEnum } from '../TypeUtil';

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
