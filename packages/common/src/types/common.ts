// Common types used across the AppKit ecosystem

export type CaipAddress = `${string}:${string}:${string}`;

export type CaipNetworkId = `${string}:${string}`;

export type ChainNamespace = 'eip155' | 'solana' | 'polkadot' | 'bip122';

export type AdapterType = 'solana' | 'wagmi' | 'ethers' | 'universal' | 'bip122';

export type AccountType = 'eoa' | 'smartAccount';

export type SocialProvider =
  | 'google'
  | 'facebook'
  | 'github'
  | 'apple'
  | 'x'
  | 'discord'
  | 'email'
  | 'farcaster';

export type ThemeMode = 'dark' | 'light';

export interface ThemeVariables {
  accent?: string;
}

export interface BaseError {
  message?: string;
}

export type ProjectId = string;

export type Platform = 'mobile' | 'web' | 'qrcode' | 'email' | 'unsupported';

export type SdkType = 'appkit';

export type SdkVersion = `react-native-${string}-${string}`;

export type RequestCache =
  | 'default'
  | 'force-cache'
  | 'no-cache'
  | 'no-store'
  | 'only-if-cached'
  | 'reload';

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[];
    methods: string[];
    events: string[];
  }
>;
