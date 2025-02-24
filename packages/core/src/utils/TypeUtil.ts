import { type EventEmitter } from 'events';
import type {
  Balance,
  SocialProvider,
  ThemeMode,
  Transaction,
  ConnectorType
} from '@reown/appkit-common-react-native';

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
      description?: string;
      url?: string;
      icons?: string[];
      redirect?: {
        native?: string;
        universal?: string;
        linkMode?: boolean;
      };
      [key: string]: unknown;
    }
  | undefined;

export interface LinkingRecord {
  redirect: string;
  href: string;
}

export type ProjectId = string;

export type Platform = 'mobile' | 'web' | 'qrcode' | 'email' | 'unsupported';

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

export type SdkType = 'appkit';

export type SdkVersion =
  | `react-native-wagmi-${string}`
  | `react-native-ethers5-${string}`
  | `react-native-ethers-${string}`;

type EnabledSocials = Exclude<SocialProvider, 'farcaster'>;

export type Features = {
  /**
   * @description Enable or disable the swaps feature. Enabled by default.
   * @type {boolean}
   */
  swaps?: boolean;
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
   * @type {EnabledSocials[]}
   */
  socials?: EnabledSocials[] | false;
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

export interface BlockchainApiSwapAllowanceResponse {
  allowance: string;
}

export interface BlockchainApiGenerateSwapCalldataRequest {
  projectId: string;
  userAddress: string;
  from: string;
  to: string;
  amount: string;
  eip155?: {
    slippage: string;
    permit?: string;
  };
}

export interface BlockchainApiGenerateSwapCalldataResponse {
  tx: {
    from: CaipAddress;
    to: CaipAddress;
    data: `0x${string}`;
    amount: string;
    eip155: {
      gas: string;
      gasPrice: string;
    };
  };
}

export interface BlockchainApiGenerateApproveCalldataRequest {
  projectId: string;
  userAddress: string;
  from: string;
  to: string;
  amount?: number;
}

export interface BlockchainApiGenerateApproveCalldataResponse {
  tx: {
    from: CaipAddress;
    to: CaipAddress;
    data: `0x${string}`;
    value: string;
    eip155: {
      gas: number;
      gasPrice: string;
    };
  };
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

export interface BlockchainApiSwapAllowanceRequest {
  projectId: string;
  tokenAddress: string;
  userAddress: string;
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

export interface BlockchainApiSwapQuoteRequest {
  projectId: string;
  chainId?: string;
  amount: string;
  userAddress: string;
  from: string;
  to: string;
  gasPrice: string;
}

export interface BlockchainApiSwapQuoteResponse {
  quotes: {
    id: string | null;
    fromAmount: string;
    fromAccount: string;
    toAmount: string;
    toAccount: string;
  }[];
}

export interface BlockchainApiSwapTokensRequest {
  projectId: string;
  chainId?: string;
}

export interface BlockchainApiSwapTokensResponse {
  tokens: SwapToken[];
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
export type EventName =
  | 'MODAL_LOADED'
  | 'MODAL_OPEN'
  | 'MODAL_CLOSE'
  | 'CLICK_ALL_WALLETS'
  | 'CLICK_NETWORKS'
  | 'SWITCH_NETWORK'
  | 'SELECT_WALLET'
  | 'CONNECT_SUCCESS'
  | 'CONNECT_ERROR'
  | 'DISCONNECT_SUCCESS'
  | 'DISCONNECT_ERROR'
  | 'CLICK_WALLET_HELP'
  | 'CLICK_NETWORK_HELP'
  | 'CLICK_GET_WALLET'
  | 'EMAIL_LOGIN_SELECTED'
  | 'EMAIL_SUBMITTED'
  | 'DEVICE_REGISTERED_FOR_EMAIL'
  | 'EMAIL_VERIFICATION_CODE_SENT'
  | 'EMAIL_VERIFICATION_CODE_PASS'
  | 'EMAIL_VERIFICATION_CODE_FAIL'
  | 'EMAIL_EDIT'
  | 'EMAIL_EDIT_COMPLETE'
  | 'EMAIL_UPGRADE_FROM_MODAL'
  | 'CLICK_SIGN_SIWE_MESSAGE'
  | 'CLICK_CANCEL_SIWE'
  | 'SIWE_AUTH_SUCCESS'
  | 'SIWE_AUTH_ERROR'
  | 'CLICK_TRANSACTIONS'
  | 'ERROR_FETCH_TRANSACTIONS'
  | 'LOAD_MORE_TRANSACTIONS'
  | 'OPEN_SEND'
  | 'OPEN_SWAP'
  | 'INITIATE_SWAP'
  | 'SWAP_SUCCESS'
  | 'SWAP_ERROR'
  | 'SEND_INITIATED'
  | 'SEND_SUCCESS'
  | 'SEND_ERROR'
  | 'SOCIAL_LOGIN_STARTED'
  | 'SOCIAL_LOGIN_SUCCESS'
  | 'SOCIAL_LOGIN_REQUEST_USER_DATA'
  | 'SOCIAL_LOGIN_CANCELED'
  | 'SOCIAL_LOGIN_ERROR'
  | 'SET_PREFERRED_ACCOUNT_TYPE';

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
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'CLICK_CANCEL_SIWE';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'SIWE_AUTH_SUCCESS';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'SIWE_AUTH_ERROR';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
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
      event: 'OPEN_SWAP';
      properties: {
        isSmartAccount: boolean;
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'INITIATE_SWAP';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
      };
    }
  | {
      type: 'track';
      event: 'SWAP_SUCCESS';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
      };
    }
  | {
      type: 'track';
      event: 'SWAP_ERROR';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
        message: string;
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
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_STARTED';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_SUCCESS';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_REQUEST_USER_DATA';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_CANCELED';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_ERROR';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SET_PREFERRED_ACCOUNT_TYPE';
      properties: {
        accountType: AppKitFrameAccountType;
        network: string;
      };
    };

// -- Send Controller Types -------------------------------------
export type EstimateGasTransactionArgs = {
  chainNamespace?: 'eip155';
  address: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
};

export interface SendTransactionArgs {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
  gas?: bigint;
  gasPrice: bigint;
  address: `0x${string}`;
  chainNamespace?: 'eip155';
}

export interface WriteContractArgs {
  receiverAddress: `0x${string}`;
  tokenAmount: bigint;
  tokenAddress: `0x${string}`;
  fromAddress: `0x${string}`;
  method: 'send' | 'transfer' | 'call';
  abi: any;
}

// -- Swap Controller Types -------------------------------------
export type SwapToken = {
  name: string;
  symbol: string;
  address: CaipAddress;
  decimals: number;
  logoUri: string;
  eip2612?: boolean;
};

export type SwapTokenWithBalance = SwapToken & {
  quantity: {
    decimals: string;
    numeric: string;
  };
  price: number;
  value: number;
};

export type SwapInputTarget = 'sourceToken' | 'toToken';

// -- Email Types ------------------------------------------------
/**
 * Matches type defined for packages/wallet/src/AppKitFrameProvider.ts
 * It's duplicated in order to decouple scaffold from email package
 */

export type AppKitFrameAccountType = 'eoa' | 'smartAccount';

export interface AppKitFrameProvider {
  readonly id: string;
  readonly name: string;
  getEventEmitter(): EventEmitter;
  getSecureSiteURL(): string;
  getSecureSiteDashboardURL(): string;
  getSecureSiteIconURL(): string;
  getEmail(): string | undefined;
  getUsername(): string | undefined;
  getLastUsedChainId(): Promise<number | undefined>;
  rejectRpcRequest(): void;
  connectEmail(payload: { email: string }): Promise<{
    action: 'VERIFY_DEVICE' | 'VERIFY_OTP';
  }>;
  connectDevice(): Promise<unknown>;
  connectSocial(uri: string): Promise<{
    chainId: string | number;
    email: string;
    address: string;
    accounts?: {
      type: AppKitFrameAccountType;
      address: string;
    }[];
    userName?: string;
  }>;
  getSocialRedirectUri(payload: { provider: SocialProvider }): Promise<{
    uri: string;
  }>;
  connectOtp(payload: { otp: string }): Promise<unknown>;
  connectFarcaster: () => Promise<{ userName: string }>;
  getFarcasterUri(): Promise<{ url: string }>;
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
    sdkType: SdkType;
    metadata?: Metadata;
  }): Promise<unknown>;
  connect(payload?: { chainId: number | undefined }): Promise<{
    chainId: number;
    email?: string | null;
    address: string;
    smartAccountDeployed: boolean;
    preferredAccountType: AppKitFrameAccountType;
  }>;
  switchNetwork(chainId: number): Promise<{
    chainId: number;
  }>;
  setPreferredAccount(type: AppKitFrameAccountType): Promise<{
    type: AppKitFrameAccountType;
    address: string;
  }>;
  setOnTimeout(callback: () => void): void;
  getSmartAccountEnabledNetworks(): Promise<{
    smartAccountEnabledNetworks: number[];
  }>;
  disconnect(): Promise<unknown>;
  request(req: any): Promise<any>;
  AuthView: () => React.JSX.Element | null;
  Webview: () => React.JSX.Element | null;
  onSetPreferredAccount: (
    callback: (values: { type: AppKitFrameAccountType; address: string }) => void
  ) => void;
}
