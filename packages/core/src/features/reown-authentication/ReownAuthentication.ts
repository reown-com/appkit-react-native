import {
  type CaipNetworkId,
  type ChainNamespace,
  type SafeStorageItems,
  SafeStorageKeys,
  type SIWXConfig,
  type SIWXMessage,
  type SIWXSession
} from '@reown/appkit-common-react-native';

import { ApiController } from '../../controllers/ApiController';
import { BlockchainApiController } from '../../controllers/BlockchainApiController';

import { ReownAuthenticationMessenger } from './ReownAuthenticationMessenger';
import { ConnectionsController } from '../../controllers/ConnectionsController';
import { CoreHelperUtil } from '../../utils/CoreHelperUtil';
import { OptionsController } from '../../controllers/OptionsController';

/**
 * This is the configuration for using SIWX with Reown Authentication service.
 * It allows you to authenticate and capture user sessions through the Reown Dashboard.
 */
export class ReownAuthentication implements SIWXConfig {
  private readonly localAuthStorageKey: keyof SafeStorageItems;
  private readonly localNonceStorageKey: keyof SafeStorageItems;
  private readonly messenger: ReownAuthenticationMessenger;

  private required: boolean;

  private listeners: ReownAuthentication.EventListeners = {
    sessionChanged: []
  };

  constructor(params: ReownAuthentication.ConstructorParams = {}) {
    this.localAuthStorageKey =
      (params.localAuthStorageKey as keyof SafeStorageItems) || SafeStorageKeys.SIWX_AUTH_TOKEN;
    this.localNonceStorageKey =
      (params.localNonceStorageKey as keyof SafeStorageItems) || SafeStorageKeys.SIWX_NONCE_TOKEN;
    this.required = params.required ?? true;

    this.messenger = new ReownAuthenticationMessenger({
      getNonce: this.getNonce.bind(this)
    });
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input);
  }

  async addSession(session: SIWXSession): Promise<void> {
    const response = await this.request({
      method: 'POST',
      key: 'authenticate',
      body: {
        data: session.cacao ? undefined : session.data,
        message: session.message,
        signature: session.signature,
        clientId: this.getClientId(),
        walletInfo: this.getWalletInfo()
      },
      headers: ['nonce']
    });

    this.setStorageToken(response.token, this.localAuthStorageKey);

    //TODO: Check this emit
    this.emit('sessionChanged', session);
  }

  async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    try {
      const sessions = await this.getStorageToken(this.localAuthStorageKey);
      if (!sessions) {
        return [];
      }

      const account = await this.request({
        method: 'GET',
        key: 'me',
        query: {},
        headers: ['auth']
      });

      if (!account) {
        return [];
      }

      const isSameAddress = account.address.toLowerCase() === address.toLowerCase();
      const isSameNetwork = account.caip2Network === chainId;

      if (!isSameAddress || !isSameNetwork) {
        return [];
      }

      const session: SIWXSession = {
        data: {
          accountAddress: account.address,
          chainId: account.caip2Network
        } as SIWXMessage.Data,
        message: '',
        signature: ''
      };

      this.emit('sessionChanged', session);

      return [session];
    } catch {
      return [];
    }
  }

  async revokeSession(_chainId: CaipNetworkId, _address: string): Promise<void> {
    return Promise.resolve(this.clearStorageTokens());
  }

  async setSessions(sessions: SIWXSession[]): Promise<void> {
    if (sessions.length === 0) {
      this.clearStorageTokens();
    } else {
      const session = (sessions.find(
        s => s.data.chainId === ConnectionsController.state.activeCaipNetworkId
      ) || sessions[0]) as SIWXSession;

      await this.addSession(session);
    }
  }

  getRequired() {
    return this.required;
  }

  async getSessionAccount() {
    const sessions = await this.getStorageToken(this.localAuthStorageKey);
    if (!sessions) {
      throw new Error('Not authenticated');
    }

    return this.request({
      method: 'GET',
      key: 'me',
      body: undefined,
      query: {
        includeAppKitAccount: true
      },
      headers: ['auth']
    });
  }

  async setSessionAccountMetadata(metadata: object | null = null) {
    const sessions = await this.getStorageToken(this.localAuthStorageKey);
    if (!sessions) {
      throw new Error('Not authenticated');
    }

    return this.request({
      method: 'PUT',
      key: 'account-metadata',
      body: { metadata },
      headers: ['auth']
    });
  }

  on<Event extends keyof ReownAuthentication.Events>(
    event: Event,
    callback: ReownAuthentication.Listener<Event>
  ) {
    this.listeners[event].push(callback);

    return () => {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      ) as ReownAuthentication.EventListeners[Event];
    };
  }

  removeAllListeners() {
    const keys = Object.keys(this.listeners) as (keyof ReownAuthentication.Events)[];
    keys.forEach(key => {
      this.listeners[key] = [];
    });
  }

  private async request<
    Method extends ReownAuthentication.Methods,
    Key extends ReownAuthentication.RequestKeys<Method>
  >({
    method,
    key,
    query,
    body,
    headers
  }: ReownAuthentication.RequestParams<Key, Method>): Promise<
    ReownAuthentication.RequestResponse<Method, Key>
  > {
    const { projectId, st, sv, domain } = this.getSDKProperties();

    const url = new URL(`${CoreHelperUtil.getApiUrl()}/auth/v1/${String(key)}`);
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('st', st);
    url.searchParams.set('sv', sv);
    url.searchParams.set('domain', domain);

    if (query) {
      Object.entries(query).forEach(([queryKey, queryValue]) =>
        url.searchParams.set(queryKey, String(queryValue))
      );
    }

    const nonceJwt = await this.getStorageToken(this.localNonceStorageKey);
    const auth = await this.getStorageToken(this.localAuthStorageKey);

    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: Array.isArray(headers)
        ? headers.reduce((acc, header) => {
            switch (header) {
              case 'nonce':
                acc['x-nonce-jwt'] = `Bearer ${nonceJwt}`;
                break;
              case 'auth':
                acc['Authorization'] = `Bearer ${auth}`;
                break;
              default:
                break;
            }

            return acc;
          }, {})
        : undefined
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json();
    }

    return null as ReownAuthentication.RequestResponse<Method, Key>;
  }

  private async getStorageToken(key: keyof SafeStorageItems): Promise<string | undefined> {
    return OptionsController.getStorage().getItem(key);
  }

  private setStorageToken(token: string, key: keyof SafeStorageItems): void {
    OptionsController.getStorage().setItem(key, token);
  }

  private clearStorageTokens(): void {
    OptionsController.getStorage().removeItem(this.localAuthStorageKey);
    OptionsController.getStorage().removeItem(this.localNonceStorageKey);
    this.emit('sessionChanged', undefined);
  }

  private async getNonce(): Promise<string> {
    const { nonce, token } = await this.request({
      method: 'GET',
      key: 'nonce'
    });

    this.setStorageToken(token, this.localNonceStorageKey);

    return nonce;
  }

  private getClientId(): string | null {
    return BlockchainApiController.state.clientId;
  }

  private getWalletInfo(): ReownAuthentication.WalletInfo | undefined {
    const connectedWalletInfo = ConnectionsController.state.walletInfo;
    const connectionProperties = ConnectionsController.state.connection?.properties;

    if (!connectedWalletInfo || !connectionProperties) {
      return undefined;
    }

    if (connectionProperties?.provider) {
      const social = connectionProperties.provider;
      const identifier = connectionProperties.email || 'unknown';

      return { type: 'social', social, identifier };
    }

    const { name, icon, type } = connectedWalletInfo;

    return {
      type: type ?? 'unknown',
      name,
      icon
    };
  }

  private getSDKProperties(): { projectId: string; st: string; sv: string; domain: string } {
    const headers = ApiController._getApiHeaders();

    return {
      projectId: headers['x-project-id'],
      st: headers['x-sdk-type'],
      sv: headers['x-sdk-version'],
      domain: headers['origin']
    };
  }

  private emit<Event extends keyof ReownAuthentication.Events>(
    event: Event,
    data: ReownAuthentication.Events[Event]
  ) {
    this.listeners[event].forEach(listener => listener(data));
  }
}

export namespace ReownAuthentication {
  export type ConstructorParams = {
    /**
     * The key to use for storing the session token in local storage.
     * @default '@appkit/siwx-auth-token'
     */
    localAuthStorageKey?: string;
    /**
     * The key to use for storing the nonce token in local storage.
     * @default '@appkit/siwx-nonce-token'
     */
    localNonceStorageKey?: string;
    /**
     * If false the wallet stays connected when user denies the signature request.
     * @default true
     */
    required?: boolean;
  };

  export type AvailableRequestHeaders = {
    nonce: {
      'x-nonce-jwt': string;
    };
    auth: {
      Authorization: string;
    };
    origin: {
      origin: string;
    };
  };

  export type RequestParams<Key extends keyof Requests[Method], Method extends Methods> = {
    method: Method;
    key: Key;
    // @ts-expect-error - This is matching correctly already
  } & Pick<Requests[Method][Key], 'query' | 'body' | 'headers'>;

  export type RequestResponse<
    Method extends Methods,
    Key extends RequestKeys<Method>
    // @ts-expect-error - This is matching correctly already
  > = Requests[Method][Key]['response'];

  export type Request<
    Body,
    Response,
    Query extends Record<string, unknown> | undefined = undefined,
    Headers extends (keyof AvailableRequestHeaders)[] | undefined = undefined
  > = (Response extends undefined
    ? {
        response?: never;
      }
    : {
        response: Response;
      }) &
    (Body extends undefined ? { body?: never } : { body: Body }) &
    (Query extends undefined ? { query?: never } : { query: Query }) &
    (Headers extends undefined ? { headers?: never } : { headers: Headers });

  export type Requests = {
    GET: {
      nonce: Request<undefined, { nonce: string; token: string }>;
      me: Request<
        undefined,
        Omit<SessionAccount, 'appKitAccount'>,
        { includeAppKitAccount?: boolean },
        ['auth']
      >;
    };
    POST: {
      'authenticate': Request<
        {
          data?: SIWXMessage.Data;
          message: string;
          signature: string;
          clientId?: string | null;
          walletInfo?: WalletInfo;
        },
        {
          token: string;
        },
        undefined,
        ['nonce']
      >;
      'sign-out': Request<undefined, never, never, ['auth']>;
    };
    PUT: {
      'account-metadata': Request<{ metadata: object | null }, unknown, undefined, ['auth']>;
    };
  };

  export type Methods = 'GET' | 'POST' | 'PUT';

  export type RequestKeys<Method extends Methods> = keyof Requests[Method];

  export type WalletInfo =
    | {
        type: 'walletconnect' | 'external' | 'unknown';
        name: string | undefined;
        icon: string | undefined;
      }
    | { type: 'social'; social: string; identifier: string };

  export type Events = {
    sessionChanged: SIWXSession | undefined;
  };

  export type Listener<Event extends keyof Events> = (event: Events[Event]) => void;

  export type EventListeners = {
    [Key in keyof Events]: Listener<Key>[];
  };

  export type SessionAccount = {
    aud: string;
    iss: string;
    exp: number;
    projectIdKey: string;
    sub: string;
    address: string;
    chainId: number | string;
    chainNamespace: ChainNamespace;
    caip2Network: string;
    uri: string;
    domain: string;
    projectUuid: string;
    profileUuid: string;
    nonce: string;
    email?: string;
    appKitAccount?: {
      uuid: string;
      caip2_chain: string;
      address: string;
      profile_uuid: string;
      created_at: string;
      is_main_account: boolean;
      verification_status: null;
      connection_method: object | null;
      metadata: object;
      last_signed_in_at: string;
      signed_up_at: string;
      updated_at: string;
    };
  };
}
