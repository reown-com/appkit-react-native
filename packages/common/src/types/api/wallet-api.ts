import type { CaipNetworkId } from '../common';

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
  chains?: readonly CaipNetworkId[];
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

export type CustomWallet = Pick<
  WcWallet,
  | 'id'
  | 'name'
  | 'homepage'
  | 'image_url'
  | 'image_id'
  | 'mobile_link'
  | 'desktop_link'
  | 'webapp_link'
  | 'link_mode'
  | 'app_store'
  | 'play_store'
> & {
  android_app_id?: string;
  ios_schema?: string;
};

export type UniversalProviderConfigOverride = {
  methods?: Record<string, string[]>;
  chains?: Record<string, string[]>;
  events?: Record<string, string[]>;
  rpcMap?: Record<string, string>;
};
