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

// -- Provider --------------------------------------------------------
export class AppKitFrameProvider {
  private webviewRef: RefObject<WebView> | undefined;

  private projectId: string;

  private metadata: AppKitFrameTypes.Metadata | undefined;

  private email: string | undefined;

  private rpcRequestHandler?: (request: AppKitFrameTypes.RPCRequest) => void;
  private rpcSuccessHandler?: (
    response: AppKitFrameTypes.RPCResponse,
    request: AppKitFrameTypes.RPCRequest
  ) => void;
  private rpcErrorHandler?: (error: Error, request: AppKitFrameTypes.RPCRequest) => void;

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

    this.getAsyncEmail().then(email => {
      this.email = email;
    });
  }

  public setWebviewRef(webviewRef: RefObject<WebView>) {
    this.webviewRef = webviewRef;
  }

  public onMessage(event: AppKitFrameTypes.FrameEvent) {
    // console.log('💻 received', event); // eslint-disable-line no-console
    this.events.emit('message', event);
  }

  public onWebviewLoaded() {
    this.webviewLoadPromiseResolver?.resolve(undefined);
  }

  public onWebviewLoadError(error: string) {
    this.webviewLoadPromiseResolver?.reject(error);
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

  public async getLoginEmailUsed() {
    const email = await AppKitFrameStorage.get(AppKitFrameConstants.EMAIL_LOGIN_USED_KEY);

    return Boolean(email);
  }

  public getEmail() {
    return this.email;
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
    try {
      const response = await this.appEvent<'ConnectSocial'>({
        type: AppKitFrameConstants.APP_CONNECT_SOCIAL,
        payload: { uri }
      } as AppKitFrameTypes.AppEvent);

      if (response.userName) {
        this.setSocialLoginSuccess(response.userName);
      }

      return response;
    } catch (error) {
      throw error;
    }
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
      this.deleteEmailLoginCache();
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
    try {
      return this.appEvent<'GetSocialRedirectUri'>({
        type: AppKitFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
        payload
      } as AppKitFrameTypes.AppEvent);
    } catch (error) {
      throw error;
    }
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

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: AppKitFrameTypes.Requests['AppGetUserRequest']) {
    const lastUsedChain = await this.getLastUsedChainId();
    const chainId = payload?.chainId ?? lastUsedChain ?? 1;
    await this.webviewLoadPromise;

    const response = await this.appEvent<'GetUser'>({
      type: AppKitFrameConstants.APP_GET_USER,
      payload: { ...payload, chainId }
    } as AppKitFrameTypes.AppEvent);

    this.setEmailLoginSuccess(response.email);
    this.setLastUsedChainId(response.chainId);

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

    this.deleteEmailLoginCache();

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

  public onRpcResponse(event: AppKitFrameTypes.FrameEvent, callback: (request: unknown) => void) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type.includes(AppKitFrameConstants.RPC_METHOD_KEY)) {
        callback(frameEvent);
      }
    });
  }

  public onIsConnected(event: AppKitFrameTypes.FrameEvent, callback: () => void) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type === AppKitFrameConstants.FRAME_GET_USER_SUCCESS) {
        callback();
      }
    });
  }

  public onNotConnected(event: AppKitFrameTypes.FrameEvent, callback: () => void) {
    this.onFrameEvent(event, frameEvent => {
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

  // -- Private Methods -------------------------------------------------
  private setNewLastEmailLoginTime() {
    AppKitFrameStorage.set(AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString());
  }

  private setSocialLoginSuccess(username: string) {
    AppKitFrameStorage.set(AppKitFrameConstants.SOCIAL_USERNAME, username);
  }

  private setEmailLoginSuccess(email: string) {
    AppKitFrameStorage.set(AppKitFrameConstants.EMAIL, email);
    AppKitFrameStorage.set(AppKitFrameConstants.EMAIL_LOGIN_USED_KEY, 'true');
    AppKitFrameStorage.delete(AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME);
    this.email = email;
  }

  private deleteEmailLoginCache() {
    AppKitFrameStorage.delete(AppKitFrameConstants.EMAIL_LOGIN_USED_KEY);
    AppKitFrameStorage.delete(AppKitFrameConstants.EMAIL);
    AppKitFrameStorage.delete(AppKitFrameConstants.LAST_USED_CHAIN_KEY);
    AppKitFrameStorage.delete(AppKitFrameConstants.SOCIAL_USERNAME);
    this.email = undefined;
  }

  private setLastUsedChainId(chainId: number) {
    AppKitFrameStorage.set(AppKitFrameConstants.LAST_USED_CHAIN_KEY, String(chainId));
  }

  private async getLastUsedChainId() {
    const chainId = await AppKitFrameStorage.get(AppKitFrameConstants.LAST_USED_CHAIN_KEY);
    if (chainId) {
      return Number(chainId);
    }

    return undefined;
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
    event: Omit<AppKitFrameTypes.AppEvent, 'id'>
  ): Promise<AppKitFrameTypes.Responses[`Frame${T}Response`]> {
    await this.webviewLoadPromise;
    const type = event.type.replace('@w3m-app/', '');

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

  private onFrameEvent(
    event: AppKitFrameTypes.FrameEvent,
    callback: (event: AppKitFrameTypes.FrameEvent) => void
  ) {
    if (
      !event.type?.includes(AppKitFrameConstants.FRAME_EVENT_KEY) ||
      event.origin !== AppKitFrameConstants.SECURE_SITE_ORIGIN
    ) {
      return;
    }
    const frameEvent = AppKitFrameSchema.frameEvent.parse(event);
    callback(frameEvent);
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
        iframe.contentWindow.postMessage(${strEvent}, '*');
      })()
      `;

    this.webviewRef.current.injectJavaScript(send);

    this.webviewRef.current.injectJavaScript(
      `window.ReactNativeWebView.postMessage('${strEvent}')`
    );
  }

  private async getAsyncEmail() {
    const email = await AppKitFrameStorage.get(AppKitFrameConstants.EMAIL);

    return email;
  }
}
