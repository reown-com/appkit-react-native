import { EventEmitter } from 'events';
import type { RefObject } from 'react';
import WebView from 'react-native-webview';
import { CoreHelperUtil } from '@reown/appkit-core-react-native';
import type { AppKitFrameTypes } from './AppKitFrameTypes';
import { AppKitFrameConstants, AppKitFrameRpcConstants } from './AppKitFrameConstants';
import { AppKitFrameStorage } from './AppKitFrameStorage';
import { AppKitFrameHelpers } from './AppKitFrameHelpers';
import { AppKitFrameSchema } from './AppKitFrameSchema';
import { AuthWebview } from './AppKitAuthWebview';
import { AppKitWebview } from './AppKitWebview';

// -- Types -----------------------------------------------------------
type AppEventType = Omit<AppKitFrameTypes.AppEvent, 'id'>;

// -- Provider --------------------------------------------------------
export class AppKitFrameProvider {
  private webviewRef: RefObject<WebView> | undefined;

  private projectId: string;

  private metadata: AppKitFrameTypes.Metadata | undefined;

  private email: string | undefined;

  private username: string | undefined;

  private rpcRequestHandler?: (request: AppKitFrameTypes.RPCRequest) => void;

  private rpcSuccessHandler?: (
    response: AppKitFrameTypes.RPCResponse,
    request: AppKitFrameTypes.RPCRequest
  ) => void;

  private rpcErrorHandler?: (error: Error, request: AppKitFrameTypes.RPCRequest) => void;

  private onTimeout?: () => void;

  public webviewLoadPromise: Promise<void>;

  public webviewLoadPromiseResolver:
    | {
        resolve: (value: undefined) => void;
        reject: (reason?: unknown) => void;
      }
    | undefined;

  public AuthView = AuthWebview;

  public Webview = AppKitWebview;

  private openRpcRequests: Array<
    AppKitFrameTypes.RPCRequest & { abortController: AbortController }
  > = [];

  public events: EventEmitter = new EventEmitter();

  public constructor(projectId: string, metadata: AppKitFrameTypes.Metadata) {
    this.webviewLoadPromise = new Promise((resolve, reject) => {
      this.webviewLoadPromiseResolver = { resolve, reject };
    });
    this.metadata = metadata;
    this.projectId = projectId;

    this.loadAsyncValues();

    this.events.setMaxListeners(Number.POSITIVE_INFINITY);
  }

  public setWebviewRef(webviewRef: RefObject<WebView>) {
    this.webviewRef = webviewRef;
  }

  public onMessage(event: AppKitFrameTypes.FrameEvent) {
    this.events.emit('message', event);
  }

  public onWebviewLoaded() {
    this.webviewLoadPromiseResolver?.resolve(undefined);
  }

  public onWebviewLoadError(error: string) {
    this.webviewLoadPromiseResolver?.reject(error);
  }

  public setOnTimeout(callback: () => void) {
    this.onTimeout = callback;
  }

  // -- Extended Methods ------------------------------------------------
  public getSecureSiteURL() {
    return `${AppKitFrameConstants.SECURE_SITE_SDK}?projectId=${this.projectId}`;
  }

  public getSecureSiteDashboardURL() {
    return AppKitFrameConstants.SECURE_SITE_DASHBOARD;
  }

  public getSecureSiteIconURL() {
    return AppKitFrameConstants.SECURE_SITE_ICON;
  }

  public getSecureSiteHeaders() {
    return { 'X-Bundle-Id': CoreHelperUtil.getBundleId() };
  }

  public getEmail() {
    return this.email;
  }

  public getUsername() {
    return this.username;
  }

  public rejectRpcRequest() {
    try {
      this.openRpcRequests.forEach(({ abortController, method }) => {
        if (!AppKitFrameRpcConstants.SAFE_RPC_METHODS.includes(method)) {
          abortController.abort();
        }
      });
      this.openRpcRequests = [];
    } catch (e) {}
  }

  public getEventEmitter() {
    return this.events;
  }

  public async connectEmail(payload: AppKitFrameTypes.Requests['AppConnectEmailRequest']) {
    await this.webviewLoadPromise;
    await AppKitFrameHelpers.checkIfAllowedToTriggerEmail();

    const response = await this.appEvent<'ConnectEmail'>({
      type: AppKitFrameConstants.APP_CONNECT_EMAIL,
      payload
    } as AppKitFrameTypes.AppEvent);

    this.setNewLastEmailLoginTime();

    return response;
  }

  public async connectDevice() {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'ConnectDevice'>({
      type: AppKitFrameConstants.APP_CONNECT_DEVICE
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async connectSocial(uri: string) {
    const response = await this.appEvent<'ConnectSocial'>({
      type: AppKitFrameConstants.APP_CONNECT_SOCIAL,
      payload: { uri }
    } as AppKitFrameTypes.AppEvent);

    if (response.userName) {
      this.setSocialLoginSuccess(response.userName);
    }

    return response;
  }

  public async getFarcasterUri() {
    const response = await this.appEvent<'GetFarcasterUri'>({
      type: AppKitFrameConstants.APP_GET_FARCASTER_URI
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async connectFarcaster() {
    const response = await this.appEvent<'ConnectFarcaster'>({
      type: AppKitFrameConstants.APP_CONNECT_FARCASTER
    } as AppKitFrameTypes.AppEvent);

    if (response.userName) {
      this.setSocialLoginSuccess(response.userName);
    }

    return response;
  }

  public async connectOtp(payload: AppKitFrameTypes.Requests['AppConnectOtpRequest']) {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'ConnectOtp'>({
      type: AppKitFrameConstants.APP_CONNECT_OTP,
      payload
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async isConnected() {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'IsConnected'>({
      type: AppKitFrameConstants.APP_IS_CONNECTED,
      payload: undefined
    } as AppKitFrameTypes.AppEvent);

    if (!response.isConnected) {
      this.deleteLoginCache();
    }

    return response;
  }

  public async getChainId() {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'GetChainId'>({
      type: AppKitFrameConstants.APP_GET_CHAIN_ID
    } as AppKitFrameTypes.AppEvent);

    this.setLastUsedChainId(response.chainId);

    return response;
  }

  public async getSocialRedirectUri(
    payload: AppKitFrameTypes.Requests['AppGetSocialRedirectUriRequest']
  ) {
    return this.appEvent<'GetSocialRedirectUri'>({
      type: AppKitFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
      payload
    } as AppKitFrameTypes.AppEvent);
  }

  public async updateEmail(payload: AppKitFrameTypes.Requests['AppUpdateEmailRequest']) {
    await this.webviewLoadPromise;
    await AppKitFrameHelpers.checkIfAllowedToTriggerEmail();

    const response = await this.appEvent<'UpdateEmail'>({
      type: AppKitFrameConstants.APP_UPDATE_EMAIL,
      payload
    } as AppKitFrameTypes.AppEvent);

    this.setNewLastEmailLoginTime();

    return response;
  }

  public async updateEmailPrimaryOtp(
    payload: AppKitFrameTypes.Requests['AppUpdateEmailPrimaryOtpRequest']
  ) {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'UpdateEmailPrimaryOtp'>({
      type: AppKitFrameConstants.APP_UPDATE_EMAIL_PRIMARY_OTP,
      payload
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async updateEmailSecondaryOtp(
    payload: AppKitFrameTypes.Requests['AppUpdateEmailSecondaryOtpRequest']
  ) {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'UpdateEmailSecondaryOtp'>({
      type: AppKitFrameConstants.APP_UPDATE_EMAIL_SECONDARY_OTP,
      payload
    } as AppKitFrameTypes.AppEvent);

    this.setEmailLoginSuccess(response.newEmail);

    return response;
  }

  public async syncTheme(payload: AppKitFrameTypes.Requests['AppSyncThemeRequest']) {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'SyncTheme'>({
      type: AppKitFrameConstants.APP_SYNC_THEME,
      payload
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async syncDappData(payload: AppKitFrameTypes.Requests['AppSyncDappDataRequest']) {
    await this.webviewLoadPromise;
    const metadata = payload.metadata ?? this.metadata;

    const response = await this.appEvent<'SyncDappData'>({
      type: AppKitFrameConstants.APP_SYNC_DAPP_DATA,
      payload: { ...payload, metadata }
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  public async getSmartAccountEnabledNetworks() {
    try {
      const response = await this.appEvent<'GetSmartAccountEnabledNetworks'>({
        type: AppKitFrameConstants.APP_GET_SMART_ACCOUNT_ENABLED_NETWORKS
      } as AppKitFrameTypes.AppEvent);
      this.persistSmartAccountEnabledNetworks(response.smartAccountEnabledNetworks);

      return response;
    } catch (error) {
      this.persistSmartAccountEnabledNetworks([]);
      throw error;
    }
  }

  public async setPreferredAccount(type: AppKitFrameTypes.AccountType) {
    const response = await this.appEvent<'SetPreferredAccount'>({
      type: AppKitFrameConstants.APP_SET_PREFERRED_ACCOUNT,
      payload: { type }
    } as AppKitFrameTypes.AppEvent);

    return response;
  }

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: AppKitFrameTypes.Requests['AppGetUserRequest']) {
    const lastUsedChain = await this.getLastUsedChainId();
    const chainId = payload?.chainId ?? lastUsedChain ?? 1;
    await this.webviewLoadPromise;

    const response = await this.appEvent<'GetUser'>({
      type: AppKitFrameConstants.APP_GET_USER,
      payload: { ...payload, chainId }
    } as AppKitFrameTypes.AppEvent);

    if (response.email) {
      this.setEmailLoginSuccess(response.email);
    }

    this.setLastUsedChainId(Number(response.chainId));

    return response;
  }

  public async switchNetwork(chainId: number) {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'SwitchNetwork'>({
      type: AppKitFrameConstants.APP_SWITCH_NETWORK,
      payload: { chainId }
    } as AppKitFrameTypes.AppEvent);

    this.setLastUsedChainId(response.chainId);

    return response;
  }

  public async disconnect() {
    await this.webviewLoadPromise;

    const response = await this.appEvent<'SignOut'>({
      type: AppKitFrameConstants.APP_SIGN_OUT
    });

    this.deleteLoginCache();

    return response;
  }

  public async request(req: AppKitFrameTypes.RPCRequest): Promise<AppKitFrameTypes.RPCResponse> {
    try {
      if (AppKitFrameRpcConstants.GET_CHAIN_ID === req.method) {
        return this.getLastUsedChainId();
      }

      this.rpcRequestHandler?.(req);
      const response = await this.appEvent<'Rpc'>({
        type: AppKitFrameConstants.APP_RPC_REQUEST,
        payload: req
      } as AppKitFrameTypes.AppEvent);
      this.rpcSuccessHandler?.(response, req);

      return response;
    } catch (error) {
      this.rpcErrorHandler?.(error as Error, req);
      throw error;
    }
  }

  public onRpcRequest(callback: (request: AppKitFrameTypes.RPCRequest) => void) {
    this.rpcRequestHandler = callback;
  }

  public onRpcSuccess(
    callback: (response: AppKitFrameTypes.FrameEvent, request: AppKitFrameTypes.RPCRequest) => void
  ) {
    this.rpcSuccessHandler = callback;
  }

  public onRpcError(callback: (error: Error) => void) {
    this.rpcErrorHandler = callback;
  }

  public onIsConnected(
    callback: (response: AppKitFrameTypes.Responses['FrameGetUserResponse']) => void
  ) {
    this.onFrameEvent(frameEvent => {
      if (frameEvent.type === AppKitFrameConstants.FRAME_GET_USER_SUCCESS) {
        callback(frameEvent.payload);
      }
    });
  }

  public onNotConnected(callback: () => void) {
    this.onFrameEvent(frameEvent => {
      if (frameEvent.type === AppKitFrameConstants.FRAME_IS_CONNECTED_ERROR) {
        callback();
      }
      if (
        frameEvent.type === AppKitFrameConstants.FRAME_IS_CONNECTED_SUCCESS &&
        !frameEvent.payload.isConnected
      ) {
        callback();
      }
    });
  }

  public onGetSmartAccountEnabledNetworks(
    callback: (
      response: AppKitFrameTypes.Responses['FrameGetSmartAccountEnabledNetworksResponse']
    ) => void
  ) {
    this.onFrameEvent(frameEvent => {
      if (
        frameEvent.type === AppKitFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS
      ) {
        callback(frameEvent.payload);
      }
    });
  }

  public onSetPreferredAccount(
    callback: (response: AppKitFrameTypes.Responses['FrameSetPreferredAccountResponse']) => void
  ) {
    this.onFrameEvent(frameEvent => {
      if (frameEvent.type === AppKitFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_SUCCESS) {
        callback(frameEvent.payload);
      }
    });
  }

  public async getLastUsedChainId() {
    const chainId = await AppKitFrameStorage.get(AppKitFrameConstants.LAST_USED_CHAIN_KEY);
    if (chainId) {
      return Number(chainId);
    }

    return undefined;
  }

  // -- Private Methods -------------------------------------------------
  private setNewLastEmailLoginTime() {
    AppKitFrameStorage.set(AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString());
  }

  private setSocialLoginSuccess(username: string) {
    AppKitFrameStorage.set(AppKitFrameConstants.SOCIAL_USERNAME, username);
    this.username = username;
  }

  private setEmailLoginSuccess(email: string) {
    AppKitFrameStorage.set(AppKitFrameConstants.EMAIL, email);
    AppKitFrameStorage.set(AppKitFrameConstants.EMAIL_LOGIN_USED_KEY, 'true');
    AppKitFrameStorage.delete(AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME);
    this.email = email;
  }

  private deleteLoginCache() {
    AppKitFrameStorage.delete(AppKitFrameConstants.EMAIL_LOGIN_USED_KEY);
    AppKitFrameStorage.delete(AppKitFrameConstants.EMAIL);
    AppKitFrameStorage.delete(AppKitFrameConstants.LAST_USED_CHAIN_KEY);
    AppKitFrameStorage.delete(AppKitFrameConstants.SOCIAL_USERNAME);
    this.email = undefined;
    this.username = undefined;
  }

  private setLastUsedChainId(chainId: number) {
    AppKitFrameStorage.set(AppKitFrameConstants.LAST_USED_CHAIN_KEY, String(chainId));
  }

  private persistSmartAccountEnabledNetworks(networks: number[]) {
    AppKitFrameStorage.set(AppKitFrameConstants.SMART_ACCOUNT_ENABLED_NETWORKS, networks.join(','));
  }

  private async registerFrameEventHandler(
    id: string,
    callback: (event: AppKitFrameTypes.FrameEvent) => void,
    signal: AbortSignal
  ) {
    const eventEmitter = this.events;
    function eventHandler(data: AppKitFrameTypes.FrameEvent) {
      if (!data.type?.includes(AppKitFrameConstants.FRAME_EVENT_KEY)) {
        return;
      }
      const frameEvent = AppKitFrameSchema.frameEvent.parse(data);
      if (frameEvent.id === id) {
        callback(frameEvent);
        eventEmitter.removeListener('message', eventHandler);
      }
    }

    eventEmitter.addListener('message', eventHandler);
    signal.addEventListener('abort', () => {
      eventEmitter.removeListener('message', eventHandler);
    });
  }

  private async appEvent<T extends AppKitFrameTypes.ProviderRequestType>(
    event: AppEventType
  ): Promise<AppKitFrameTypes.Responses[`Frame${T}Response`]> {
    await this.webviewLoadPromise;
    let timer: NodeJS.Timeout;

    function replaceEventType(type: AppEventType['type']) {
      return type.replace('@w3m-app/', '');
    }

    const type = replaceEventType(event.type);

    const shouldCheckForTimeout = [
      AppKitFrameConstants.APP_IS_CONNECTED,
      AppKitFrameConstants.APP_GET_USER,
      AppKitFrameConstants.APP_CONNECT_EMAIL,
      AppKitFrameConstants.APP_CONNECT_DEVICE,
      AppKitFrameConstants.APP_CONNECT_OTP,
      AppKitFrameConstants.APP_CONNECT_SOCIAL,
      AppKitFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
      AppKitFrameConstants.APP_GET_FARCASTER_URI
    ]
      .map(replaceEventType)
      .includes(type);

    if (shouldCheckForTimeout && this.onTimeout) {
      // 15 seconds timeout
      timer = setTimeout(this.onTimeout, 15000);
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);

      this.postAppEvent({ ...event, id } as AppKitFrameTypes.AppEvent);
      const abortController = new AbortController();
      if (type === 'RPC_REQUEST') {
        const rpcEvent = event as Extract<
          AppKitFrameTypes.AppEvent,
          { type: '@w3m-app/RPC_REQUEST' }
        >;
        this.openRpcRequests = [...this.openRpcRequests, { ...rpcEvent.payload, abortController }];
      }
      abortController.signal.addEventListener('abort', () => {
        if (type === 'RPC_REQUEST') {
          reject(new Error('Request was aborted'));
        }
      });

      function handler(frameEvent: AppKitFrameTypes.FrameEvent) {
        if (frameEvent.type === `@w3m-frame/${type}_SUCCESS`) {
          if (timer) {
            clearTimeout(timer);
          }
          if ('payload' in frameEvent) {
            resolve(frameEvent.payload);
          }
          resolve(undefined as unknown as AppKitFrameTypes.Responses[`Frame${T}Response`]);
        } else if (frameEvent.type === `@w3m-frame/${type}_ERROR`) {
          if ('payload' in frameEvent) {
            reject(new Error(frameEvent.payload?.message || 'An error occurred'));
          }
          reject(new Error('An error occurred'));
        }
      }
      this.registerFrameEventHandler(id, handler, abortController.signal);
    });
  }

  private onFrameEvent(callback: (event: AppKitFrameTypes.FrameEvent) => void) {
    const eventHandler = (event: AppKitFrameTypes.FrameEvent) => {
      if (
        !event.type?.includes(AppKitFrameConstants.FRAME_EVENT_KEY) ||
        event.origin !== AppKitFrameConstants.SECURE_SITE_ORIGIN
      ) {
        return;
      }
      // console.log('💻 received', event); // eslint-disable-line no-console
      callback(event);
    };

    this.events.addListener('message', eventHandler);
  }

  private postAppEvent(event: AppKitFrameTypes.AppEvent) {
    if (!this.webviewRef?.current) {
      throw new Error('AppKitFrameProvider: webviewRef is not set');
    }

    AppKitFrameSchema.appEvent.parse(event);
    const strEvent = JSON.stringify(event);
    // console.log('📡 sending', strEvent); // eslint-disable-line no-console
    const send = `
      (function() {
        let iframe = document.getElementById('frame-mobile-sdk');
        iframe.contentWindow.postMessage(${strEvent}, '*');
      })()
      `;

    this.webviewRef.current.injectJavaScript(send);

    this.webviewRef.current.injectJavaScript(
      `window.ReactNativeWebView.postMessage('${strEvent}')`
    );
  }

  private async loadAsyncValues() {
    const email = await AppKitFrameStorage.get(AppKitFrameConstants.EMAIL);
    this.email = email;
    const username = await AppKitFrameStorage.get(AppKitFrameConstants.SOCIAL_USERNAME);
    this.username = username;
  }
}
