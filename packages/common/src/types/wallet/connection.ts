import type { CaipAddress, CaipNetworkId, SocialProvider, AccountType } from '../common';
import type { Balance } from '../blockchain/balance';
import type { WalletInfo, Identity } from './wallet-info';
import type { BlockchainAdapter } from '../../adapters/BlockchainAdapter';

export interface Connection {
  accounts: CaipAddress[];
  balances: Map<CaipAddress, Balance[]>;
  adapter: BlockchainAdapter;
  caipNetwork: CaipNetworkId;
  wallet?: WalletInfo;
  properties?: ConnectionProperties;
  type?: AccountType;
  identities?: Map<CaipAddress, Identity>;
}

export interface ConnectionProperties {
  email?: string;
  username?: string;
  smartAccounts?: CaipAddress[];
  provider?: SocialProvider;
  sessionTopic?: string;
  canAddEvmChain?: boolean;
}

export interface LinkingRecord {
  redirect: string;
  href: string;
}

export interface WalletDeepLink {
  href: string;
  name: string;
}
