import type { SessionTypes } from '@walletconnect/types';
import type UniversalProvider from '@walletconnect/universal-provider/dist/types/UniversalProvider';
import type { ethers } from 'ethers';

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  initialized: boolean;
  provider?: UniversalProvider;
  web3Provider?: ethers.providers.Web3Provider;
  session?: SessionTypes.Struct;
}

// -- ConfigCtrl ------------------------------------------- //
export interface ConfigCtrlState {
  projectId: string;
  themeMode?: 'dark' | 'light';
}

// -- ModalCtrl --------------------------------------- //
export interface ModalCtrlState {
  open: boolean;
}

// -- OptionsCtrl --------------------------------------- //
export interface OptionsCtrlState {
  address?: string;
  isConnected: boolean;
  isDataLoaded: boolean;
  sessionUri?: string;
}

// -- ExplorerCtrl ------------------------------------------- //
export interface ExplorerCtrlState {
  wallets: ListingResponse & { page: number };
}

export interface ListingParams {
  page?: number;
  search?: string;
  entries?: number;
  version?: number;
  chains?: string;
}

export interface PlatformInfo {
  native: string;
  universal: string;
}

export interface Listing {
  id: string;
  name: string;
  description: string;
  homepage: string;
  chains: string[];
  versions: string[];
  app_type: string;
  image_id: string;
  image_url: {
    sm: string;
    md: string;
    lg: string;
  };
  app: {
    browser: string;
    ios: string;
    android: string;
    mac: string;
    window: string;
    linux: string;
  };
  mobile: PlatformInfo;
  desktop: PlatformInfo;
  metadata: {
    shortName: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export interface ListingResponse {
  listings: Listing[];
  total: number;
}

// -- RouterCtrl --------------------------------------------- //
export type RouterView =
  | 'ConnectWallet'
  | 'Qrcode'
  | 'WalletExplorer'
  | 'Account';

export interface RouterCtrlState {
  history: RouterView[];
  view: RouterView;
}
