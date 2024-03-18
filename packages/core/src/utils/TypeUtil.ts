export type CaipAddress = `${string}:${string}:${string}`;

export type CaipNetworkId = `${string}:${string}`;

export interface CaipNetwork {
  id: CaipNetworkId;
  name?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface LinkingRecord {
  redirect: string;
  href: string;
}

export type ProjectId = string;

export type Platform = 'mobile' | 'web' | 'qrcode' | 'email' | 'unsupported';

export type ConnectorType = 'WALLET_CONNECT' | 'COINBASE' | 'EMAIL' | 'EXTERNAL';

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

export type ThemeMode = 'dark' | 'light';

export interface ThemeVariables {
  accent?: string;
}

// -- BlockchainApiController Types ---------------------------------------------
export interface BlockchainApiIdentityRequest {
  caipChainId: CaipNetworkId;
  address: string;
}

export interface BlockchainApiIdentityResponse {
  avatar: string;
  name: string;
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
      };
    }
  | {
      type: 'track';
      event: 'CONNECT_SUCCESS';
      properties: {
        name: string;
        method: Platform;
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
    };
