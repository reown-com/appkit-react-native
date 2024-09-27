import type { Balance, SocialProvider, Transaction } from '@reown/appkit-common-react-native';

export interface BaseError {
  message?: string;
}

export type CaipAddress = `${string}:${string}:${string}`;

export type CaipNetworkId = `${string}:${string}`;

export interface CaipNetwork {
  id: CaipNetworkId;
  name?: string;
  imageId?: string;
  imageUrl?: string;
}

export type ConnectedWalletInfo =
  | {
      name?: string;
      icon?: string;
      [key: string]: unknown;
    }
  | undefined;

export interface LinkingRecord {
  redirect: string;
  href: string;
}

export type ProjectId = string;

export type Platform = 'mobile' | 'web' | 'qrcode' | 'email' | 'unsupported';

export type ConnectorType = 'WALLET_CONNECT' | 'COINBASE' | 'AUTH' | 'EXTERNAL';

export type Connector = {
  id: string;
  type: ConnectorType;
  name?: string;
  imageId?: string;
  explorerId?: string;
  imageUrl?: string;
  info?: { rdns?: string };
  provider?: unknown;
  installed?: boolean;
};

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[];
    methods: string[];
    events: string[];
  }
>;

export type SdkVersion =
  | `react-native-wagmi-${string}`
  | `react-native-ethers5-${string}`
  | `react-native-ethers-${string}`;

export type Features = {
  /**
   * @description Enable or disable the email feature. Enabled by default.
   * @type {boolean}
   */
  email?: boolean;
  /**
   * @description Show or hide the regular wallet options when email is enabled. Enabled by default.
   * @type {boolean}
   */
  emailShowWallets?: boolean;
  /**
   * @description Enable or disable the socials feature. Enabled by default.
   * @type {FeaturesSocials[]}
   */
  socials?: SocialProvider[] | false;
};

// -- ApiController Types -------------------------------------------------------
export interface WcWallet {
  id: string;
  name: string;
  homepage?: string;
  image_id?: string;
  image_url?: string;
  order?: number;
  mobile_link?: string | null;
  desktop_link?: string | null;
  webapp_link?: string | null;
  link_mode?: string | null;
  app_store?: string | null;
  play_store?: string | null;
}

export interface DataWallet {
  id: string;
  ios_schema?: string;
  android_app_id?: string;
}

export interface ApiGetWalletsRequest {
  page: number;
  entries: number;
  search?: string;
  include?: string[];
  exclude?: string[];
}

export interface ApiGetWalletsResponse {
  data: WcWallet[];
  count: number;
}

export interface ApiGetDataWalletsResponse {
  data: DataWallet[];
  count: number;
}

export interface ApiGetAnalyticsConfigResponse {
  isAnalyticsEnabled: boolean;
}

export type RequestCache =
  | 'default'
  | 'force-cache'
  | 'no-cache'
  | 'no-store'
  | 'only-if-cached'
  | 'reload';

// -- ThemeController Types ---------------------------------------------------

export type ThemeMode = 'dark' | 'light';

export interface ThemeVariables {
  accent?: string;
}

// -- BlockchainApiController Types ---------------------------------------------
export interface BlockchainApiIdentityRequest {
  address: string;
}

export interface BlockchainApiIdentityResponse {
  avatar: string;
  name: string;
}

export interface BlockchainApiBalanceResponse {
  balances: Balance[];
}

export interface BlockchainApiTransactionsRequest {
  account: string;
  projectId: string;
  cursor?: string;
  onramp?: 'coinbase';
  signal?: AbortSignal;
  cache?: RequestCache;
}

export interface BlockchainApiTransactionsResponse {
  data: Transaction[];
  next: string | null;
}

export interface BlockchainApiTokenPriceRequest {
  projectId: string;
  currency?: 'usd' | 'eur' | 'gbp' | 'aud' | 'cad' | 'inr' | 'jpy' | 'btc' | 'eth';
  addresses: string[];
}

export interface BlockchainApiTokenPriceResponse {
  fungibles: {
    name: string;
    symbol: string;
    iconUrl: string;
    price: number;
  }[];
}

export interface BlockchainApiGasPriceRequest {
  projectId: string;
  chainId: string;
}

export interface BlockchainApiGasPriceResponse {
  standard: string;
  fast: string;
  instant: string;
}

export interface BlockchainApiEnsError extends BaseError {
  status: string;
  reasons: { name: string; description: string }[];
}

export type ReownName = `${string}.reown.id` | `${string}.wcn.id`;

export interface BlockchainApiLookupEnsName {
  name: ReownName;
  registered: number;
  updated: number;
  addresses: Record<
    string,
    {
      address: string;
      created: string;
    }
  >;
  attributes: {
    avatar?: string;
    bio?: string;
  }[];
}

// -- OptionsController Types ---------------------------------------------------
export interface Token {
  address: string;
  image?: string;
}

export type Tokens = Record<CaipNetworkId, Token>;

export type Metadata = {
  name: string;
  description: string;
  url: string;
  icons: string[];
  redirect?: {
    native?: string;
    universal?: string;
    linkMode?: boolean;
  };
};

export type CustomWallet = Pick<
  WcWallet,
  | 'id'
  | 'name'
  | 'homepage'
  | 'image_url'
  | 'mobile_link'
  | 'desktop_link'
  | 'webapp_link'
  | 'link_mode'
  | 'app_store'
  | 'play_store'
>;

// -- EventsController Types ----------------------------------------------------

export type Event =
  | {
      type: 'track';
      event: 'MODAL_CREATED';
    }
  | {
      type: 'track';
      event: 'MODAL_LOADED';
    }
  | {
      type: 'track';
      event: 'MODAL_OPEN';
      properties: {
        connected: boolean;
      };
    }
  | {
      type: 'track';
      event: 'MODAL_CLOSE';
      properties: {
        connected: boolean;
      };
    }
  | {
      type: 'track';
      event: 'CLICK_ALL_WALLETS';
    }
  | {
      type: 'track';
      event: 'CLICK_NETWORKS';
    }
  | {
      type: 'track';
      event: 'SWITCH_NETWORK';
      properties: {
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'SELECT_WALLET';
      properties: {
        name: string;
        platform?: Platform;
        explorer_id?: string;
      };
    }
  | {
      type: 'track';
      event: 'CONNECT_SUCCESS';
      properties: {
        name: string;
        method: Platform;
        explorer_id?: string;
      };
    }
  | {
      type: 'track';
      event: 'CONNECT_ERROR';
      properties: {
        message: string;
      };
    }
  | {
      type: 'track';
      event: 'DISCONNECT_SUCCESS';
    }
  | {
      type: 'track';
      event: 'DISCONNECT_ERROR';
    }
  | {
      type: 'track';
      event: 'CLICK_WALLET_HELP';
    }
  | {
      type: 'track';
      event: 'CLICK_NETWORK_HELP';
    }
  | {
      type: 'track';
      event: 'CLICK_GET_WALLET';
    }
  | {
      type: 'track';
      event: 'EMAIL_LOGIN_SELECTED';
    }
  | {
      type: 'track';
      event: 'EMAIL_SUBMITTED';
    }
  | {
      type: 'track';
      event: 'DEVICE_REGISTERED_FOR_EMAIL';
    }
  | {
      type: 'track';
      event: 'EMAIL_VERIFICATION_CODE_SENT';
    }
  | {
      type: 'track';
      event: 'EMAIL_VERIFICATION_CODE_PASS';
    }
  | {
      type: 'track';
      event: 'EMAIL_VERIFICATION_CODE_FAIL';
    }
  | {
      type: 'track';
      event: 'EMAIL_EDIT';
    }
  | {
      type: 'track';
      event: 'EMAIL_EDIT_COMPLETE';
    }
  | {
      type: 'track';
      event: 'EMAIL_UPGRADE_FROM_MODAL';
    }
  | {
      type: 'track';
      event: 'CLICK_SIGN_SIWE_MESSAGE';
    }
  | {
      type: 'track';
      event: 'CLICK_CANCEL_SIWE';
    }
  | {
      type: 'track';
      event: 'SIWE_AUTH_SUCCESS';
    }
  | {
      type: 'track';
      event: 'SIWE_AUTH_ERROR';
    }
  | {
      type: 'track';
      event: 'CLICK_TRANSACTIONS';
      properties: {
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'ERROR_FETCH_TRANSACTIONS';
      properties: {
        address: string;
        projectId: string;
        cursor: string | undefined;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'LOAD_MORE_TRANSACTIONS';
      properties: {
        address: string | undefined;
        projectId: string;
        cursor: string | undefined;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'OPEN_SEND';
      properties: {
        isSmartAccount: boolean;
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'SEND_INITIATED';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    }
  | {
      type: 'track';
      event: 'SEND_SUCCESS';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    }
  | {
      type: 'track';
      event: 'SEND_ERROR';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    };

// -- Send Controller Types -------------------------------------

export interface SendTransactionArgs {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  gas?: bigint;
  gasPrice: bigint;
  address: `0x${string}`;
}

export interface WriteContractArgs {
  receiverAddress: `0x${string}`;
  tokenAmount: bigint;
  tokenAddress: `0x${string}`;
  fromAddress: `0x${string}`;
  method: 'send' | 'transfer' | 'call';
  abi: any;
}

// -- Email Types ------------------------------------------------
/**
 * Matches type defined for packages/wallet/src/AppKitFrameProvider.ts
 * It's duplicated in order to decouple scaffold from email package
 */
export interface AppKitFrameProvider {
  readonly id: string;
  readonly name: string;
  getSecureSiteURL(): string;
  getSecureSiteDashboardURL(): string;
  getSecureSiteIconURL(): string;
  getSecureSiteHeaders(): Record<string, string>;
  getLoginEmailUsed(): Promise<boolean>;
  getEmail(): string | undefined;
  rejectRpcRequest(): void;
  connectEmail(payload: { email: string }): Promise<{
    action: 'VERIFY_DEVICE' | 'VERIFY_OTP';
  }>;
  connectDevice(): Promise<unknown>;
  connectSocial(uri: string): Promise<{
    chainId: string | number;
    email: string;
    address: string;
    accounts?:
      | {
          type: 'eoa' | 'smartAccount';
          address: string;
        }[]
      | undefined;
    userName?: string | undefined;
  }>;
  getSocialRedirectUri(payload: { provider: SocialProvider }): Promise<{
    uri: string;
  }>;
  connectOtp(payload: { otp: string }): Promise<unknown>;
  isConnected(): Promise<{
    isConnected: boolean;
  }>;
  getChainId(): Promise<{
    chainId: number;
  }>;
  updateEmail(payload: { email: string }): Promise<{
    action: 'VERIFY_PRIMARY_OTP' | 'VERIFY_SECONDARY_OTP';
  }>;
  updateEmailPrimaryOtp(payload: { otp: string }): Promise<unknown>;
  updateEmailSecondaryOtp(payload: { otp: string }): Promise<{
    newEmail: string;
  }>;
  syncTheme(payload: {
    themeMode: ThemeMode | undefined;
    themeVariables: Record<string, string | number> | undefined;
  }): Promise<unknown>;
  syncDappData(payload: {
    projectId: string;
    sdkVersion: SdkVersion;
    metadata?: Metadata;
  }): Promise<unknown>;
  connect(payload?: { chainId: number | undefined }): Promise<{
    chainId: number;
    email: string;
    address: string;
  }>;
  switchNetwork(chainId: number): Promise<{
    chainId: number;
  }>;
  disconnect(): Promise<unknown>;
  request(req: any): Promise<any>;
  AuthView: () => JSX.Element | null;
  Webview: () => JSX.Element | null;
}
