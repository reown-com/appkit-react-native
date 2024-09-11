import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import { CoreHelperUtil } from '@reown/appkit-core-react-native';
import type { AppKitFrameTypes } from './AppKitFrameTypes';
import { AppKitFrameConstants, AppKitFrameRpcConstants } from './AppKitFrameConstants';
import { AppKitFrameStorage } from './AppKitFrameStorage';
import { AppKitFrameHelpers } from './AppKitFrameHelpers';
import { AppKitFrameSchema } from './AppKitFrameSchema';
import { EmailWebview } from './AppKitEmailWebview';

// -- Types -----------------------------------------------------------
type Resolver<T> = { resolve: (value: T) => void; reject: (reason?: unknown) => void } | undefined;
type ConnectEmailResolver = Resolver<AppKitFrameTypes.Responses['FrameConnectEmailResponse']>;
type ConnectDeviceResolver = Resolver<undefined>;
type ConnectOtpResolver = Resolver<undefined>;
type ConnectResolver = Resolver<AppKitFrameTypes.Responses['FrameGetUserResponse']>;
type DisconnectResolver = Resolver<undefined>;
type IsConnectedResolver = Resolver<AppKitFrameTypes.Responses['FrameIsConnectedResponse']>;
type GetChainIdResolver = Resolver<AppKitFrameTypes.Responses['FrameGetChainIdResponse']>;
type SwitchChainResolver = Resolver<AppKitFrameTypes.Responses['FrameSwitchNetworkResponse']>;
type RpcRequestResolver = Resolver<AppKitFrameTypes.RPCResponse>;
type UpdateEmailResolver = Resolver<AppKitFrameTypes.Responses['FrameUpdateEmailResponse']>;
type UpdateEmailPrimaryOtpResolver = Resolver<undefined>;
type UpdateEmailSecondaryOtpResolver = Resolver<
  AppKitFrameTypes.Responses['FrameUpdateEmailSecondaryOtpResolver']
>;
type SyncThemeResolver = Resolver<undefined>;
type SyncDappDataResolver = Resolver<undefined>;

// -- Provider --------------------------------------------------------
export class AppKitFrameProvider {
  private webviewRef: RefObject<WebView> | undefined;

  private projectId: string;

  private metadata: AppKitFrameTypes.Metadata | undefined;

  private email: string | undefined;

  public webviewLoadPromise: Promise<void>;

  public webviewLoadPromiseResolver:
    | {
        resolve: (value: undefined) => void;
        reject: (reason?: unknown) => void;
      }
    | undefined;

  public EmailView = EmailWebview;

  private connectEmailResolver: ConnectEmailResolver = undefined;

  private connectDeviceResolver: ConnectDeviceResolver = undefined;

  private connectOtpResolver: ConnectOtpResolver | undefined = undefined;

  private connectResolver: ConnectResolver = undefined;

  private disconnectResolver: DisconnectResolver = undefined;

  private isConnectedResolver: IsConnectedResolver = undefined;

  private getChainIdResolver: GetChainIdResolver = undefined;

  private switchChainResolver: SwitchChainResolver = undefined;

  private rpcRequestResolver: RpcRequestResolver = undefined;

  private updateEmailResolver: UpdateEmailResolver = undefined;

  private updateEmailPrimaryOtpResolver: UpdateEmailPrimaryOtpResolver = undefined;

  private updateEmailSecondaryOtpResolver: UpdateEmailSecondaryOtpResolver = undefined;

  private syncThemeResolver: SyncThemeResolver = undefined;

  private syncDappDataResolver: SyncDappDataResolver = undefined;

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

  public onMessage(e: AppKitFrameTypes.FrameEvent) {
    this.onFrameEvent(e, event => {
      // console.log('💻 received', e); // eslint-disable-line no-console
      switch (event.type) {
        case AppKitFrameConstants.FRAME_CONNECT_EMAIL_SUCCESS:
          return this.onConnectEmailSuccess(event);
        case AppKitFrameConstants.FRAME_CONNECT_EMAIL_ERROR:
          return this.onConnectEmailError(event);
        case AppKitFrameConstants.FRAME_CONNECT_DEVICE_SUCCESS:
          return this.onConnectDeviceSuccess();
        case AppKitFrameConstants.FRAME_CONNECT_DEVICE_ERROR:
          return this.onConnectDeviceError(event);
        case AppKitFrameConstants.FRAME_CONNECT_OTP_SUCCESS:
          return this.onConnectOtpSuccess();
        case AppKitFrameConstants.FRAME_CONNECT_OTP_ERROR:
          return this.onConnectOtpError(event);
        case AppKitFrameConstants.FRAME_GET_USER_SUCCESS:
          return this.onConnectSuccess(event);
        case AppKitFrameConstants.FRAME_GET_USER_ERROR:
          return this.onConnectError(event);
        case AppKitFrameConstants.FRAME_IS_CONNECTED_SUCCESS:
          return this.onIsConnectedSuccess(event);
        case AppKitFrameConstants.FRAME_IS_CONNECTED_ERROR:
          return this.onIsConnectedError(event);
        case AppKitFrameConstants.FRAME_GET_CHAIN_ID_SUCCESS:
          return this.onGetChainIdSuccess(event);
        case AppKitFrameConstants.FRAME_GET_CHAIN_ID_ERROR:
          return this.onGetChainIdError(event);
        case AppKitFrameConstants.FRAME_SIGN_OUT_SUCCESS:
          return this.onSignOutSuccess();
        case AppKitFrameConstants.FRAME_SIGN_OUT_ERROR:
          return this.onSignOutError(event);
        case AppKitFrameConstants.FRAME_SWITCH_NETWORK_SUCCESS:
          return this.onSwitchChainSuccess(event);
        case AppKitFrameConstants.FRAME_SWITCH_NETWORK_ERROR:
          return this.onSwitchChainError(event);
        case AppKitFrameConstants.FRAME_RPC_REQUEST_SUCCESS:
          return this.onRpcRequestSuccess(event);
        case AppKitFrameConstants.FRAME_RPC_REQUEST_ERROR:
          return this.onRpcRequestError(event);
        case AppKitFrameConstants.FRAME_SESSION_UPDATE:
          return this.onSessionUpdate(event);
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_SUCCESS:
          return this.onUpdateEmailSuccess(event);
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_ERROR:
          return this.onUpdateEmailError(event);
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_SUCCESS:
          return this.onUpdateEmailPrimaryOtpSuccess();
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_ERROR:
          return this.onUpdateEmailPrimaryOtpError(event);
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_SUCCESS:
          return this.onUpdateEmailSecondaryOtpSuccess(event);
        case AppKitFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_ERROR:
          return this.onUpdateEmailSecondaryOtpError(event);
        case AppKitFrameConstants.FRAME_SYNC_THEME_SUCCESS:
          return this.onSyncThemeSuccess();
        case AppKitFrameConstants.FRAME_SYNC_THEME_ERROR:
          return this.onSyncThemeError(event);
        case AppKitFrameConstants.FRAME_SYNC_DAPP_DATA_SUCCESS:
          return this.onSyncDappDataSuccess();
        case AppKitFrameConstants.FRAME_SYNC_DAPP_DATA_ERROR:
          return this.onSyncDappDataError(event);
        default:
          return null;
      }
    });
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
    this.rpcRequestResolver?.reject();
  }

  public async connectEmail(payload: AppKitFrameTypes.Requests['AppConnectEmailRequest']) {
    await this.webviewLoadPromise;
    await AppKitFrameHelpers.checkIfAllowedToTriggerEmail();
    this.postAppEvent({ type: AppKitFrameConstants.APP_CONNECT_EMAIL, payload });

    return new Promise<AppKitFrameTypes.Responses['FrameConnectEmailResponse']>(
      (resolve, reject) => {
        this.connectEmailResolver = { resolve, reject };
      }
    );
  }

  public async connectDevice() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: AppKitFrameConstants.APP_CONNECT_DEVICE });

    return new Promise((resolve, reject) => {
      this.connectDeviceResolver = { resolve, reject };
    });
  }

  public async connectOtp(payload: AppKitFrameTypes.Requests['AppConnectOtpRequest']) {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: AppKitFrameConstants.APP_CONNECT_OTP, payload });

    return new Promise((resolve, reject) => {
      this.connectOtpResolver = { resolve, reject };
    });
  }

  public async isConnected() {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_IS_CONNECTED,
      payload: undefined
    });

    return new Promise<AppKitFrameTypes.Responses['FrameIsConnectedResponse']>(
      (resolve, reject) => {
        this.isConnectedResolver = { resolve, reject };
      }
    );
  }

  public async getChainId() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: AppKitFrameConstants.APP_GET_CHAIN_ID });

    return new Promise<AppKitFrameTypes.Responses['FrameGetChainIdResponse']>((resolve, reject) => {
      this.getChainIdResolver = { resolve, reject };
    });
  }

  public async updateEmail(payload: AppKitFrameTypes.Requests['AppUpdateEmailRequest']) {
    await this.webviewLoadPromise;
    await AppKitFrameHelpers.checkIfAllowedToTriggerEmail();
    this.postAppEvent({ type: AppKitFrameConstants.APP_UPDATE_EMAIL, payload });

    return new Promise<AppKitFrameTypes.Responses['FrameUpdateEmailResponse']>(
      (resolve, reject) => {
        this.updateEmailResolver = { resolve, reject };
      }
    );
  }

  public async updateEmailPrimaryOtp(
    payload: AppKitFrameTypes.Requests['AppUpdateEmailPrimaryOtpRequest']
  ) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_UPDATE_EMAIL_PRIMARY_OTP,
      payload
    });

    return new Promise((resolve, reject) => {
      this.updateEmailPrimaryOtpResolver = { resolve, reject };
    });
  }

  public async updateEmailSecondaryOtp(
    payload: AppKitFrameTypes.Requests['AppUpdateEmailSecondaryOtpRequest']
  ) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_UPDATE_EMAIL_SECONDARY_OTP,
      payload
    });

    return new Promise<AppKitFrameTypes.Responses['FrameUpdateEmailSecondaryOtpResolver']>(
      (resolve, reject) => {
        this.updateEmailSecondaryOtpResolver = { resolve, reject };
      }
    );
  }

  public async syncTheme(payload: AppKitFrameTypes.Requests['AppSyncThemeRequest']) {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: AppKitFrameConstants.APP_SYNC_THEME, payload });

    return new Promise((resolve, reject) => {
      this.syncThemeResolver = { resolve, reject };
    });
  }

  public async syncDappData(payload: AppKitFrameTypes.Requests['AppSyncDappDataRequest']) {
    await this.webviewLoadPromise;
    const metadata = payload.metadata ?? this.metadata;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_SYNC_DAPP_DATA,
      payload: { ...payload, metadata }
    });

    return new Promise((resolve, reject) => {
      this.syncDappDataResolver = { resolve, reject };
    });
  }

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: AppKitFrameTypes.Requests['AppGetUserRequest']) {
    const lastUsedChain = await this.getLastUsedChainId();
    const chainId = payload?.chainId ?? lastUsedChain ?? 1;
    await this.webviewLoadPromise;

    this.postAppEvent({
      type: AppKitFrameConstants.APP_GET_USER,
      payload: { chainId }
    });

    return new Promise<AppKitFrameTypes.Responses['FrameGetUserResponse']>((resolve, reject) => {
      this.connectResolver = { resolve, reject };
    });
  }

  public async switchNetwork(chainId: number) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_SWITCH_NETWORK,
      payload: { chainId }
    });

    return new Promise<AppKitFrameTypes.Responses['FrameSwitchNetworkResponse']>(
      (resolve, reject) => {
        this.switchChainResolver = { resolve, reject };
      }
    );
  }

  public async disconnect() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: AppKitFrameConstants.APP_SIGN_OUT });

    return new Promise((resolve, reject) => {
      this.disconnectResolver = { resolve, reject };
    });
  }

  public async request(req: AppKitFrameTypes.RPCRequest) {
    if (AppKitFrameRpcConstants.GET_CHAIN_ID === req.method) {
      return await this.getLastUsedChainId();
    }
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: AppKitFrameConstants.APP_RPC_REQUEST,
      payload: req
    });

    return new Promise<AppKitFrameTypes.RPCResponse>((resolve, reject) => {
      this.rpcRequestResolver = { resolve, reject };
    });
  }

  public onRpcRequest(event: AppKitFrameTypes.AppEvent, callback: (request: unknown) => void) {
    this.onAppEvent(event, appEvent => {
      if (appEvent.type.includes(AppKitFrameConstants.RPC_METHOD_KEY)) {
        callback(appEvent);
      }
    });
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

  // -- Promise Handlers ------------------------------------------------
  private onConnectEmailSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_SUCCESS' }>
  ) {
    this.connectEmailResolver?.resolve(event.payload);
    this.setNewLastEmailLoginTime();
  }

  private onConnectEmailError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_ERROR' }>
  ) {
    this.connectEmailResolver?.reject(event.payload.message);
  }

  private onConnectDeviceSuccess() {
    this.connectDeviceResolver?.resolve(undefined);
  }

  private onConnectDeviceError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_DEVICE_ERROR' }>
  ) {
    this.connectDeviceResolver?.reject(event.payload.message);
  }

  private onConnectOtpSuccess() {
    this.connectOtpResolver?.resolve(undefined);
  }

  private onConnectOtpError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_OTP_ERROR' }>
  ) {
    this.connectOtpResolver?.reject(event.payload.message);
  }

  private onConnectSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_SUCCESS' }>
  ) {
    this.setEmailLoginSuccess(event.payload.email);
    this.setLastUsedChainId(event.payload.chainId);
    this.connectResolver?.resolve(event.payload);
  }

  private onConnectError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_ERROR' }>
  ) {
    this.connectResolver?.reject(event.payload.message);
  }

  private onIsConnectedSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_SUCCESS' }>
  ) {
    if (!event.payload.isConnected) {
      this.deleteEmailLoginCache();
    }
    this.isConnectedResolver?.resolve(event.payload);
  }

  private onIsConnectedError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_ERROR' }>
  ) {
    this.isConnectedResolver?.reject(event.payload.message);
  }

  private onGetChainIdSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_SUCCESS' }>
  ) {
    this.setLastUsedChainId(event.payload.chainId);
    this.getChainIdResolver?.resolve(event.payload);
  }

  private onGetChainIdError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_ERROR' }>
  ) {
    this.getChainIdResolver?.reject(event.payload.message);
  }

  private onSignOutSuccess() {
    this.disconnectResolver?.resolve(undefined);
    this.deleteEmailLoginCache();
  }

  private onSignOutError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SIGN_OUT_ERROR' }>
  ) {
    this.disconnectResolver?.reject(event.payload.message);
  }

  private onSwitchChainSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SWITCH_NETWORK_SUCCESS' }>
  ) {
    this.setLastUsedChainId(event.payload.chainId);
    this.switchChainResolver?.resolve(event.payload);
  }

  private onSwitchChainError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SWITCH_NETWORK_ERROR' }>
  ) {
    this.switchChainResolver?.reject(event.payload.message);
  }

  private onRpcRequestSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/RPC_REQUEST_SUCCESS' }>
  ) {
    this.rpcRequestResolver?.resolve(event.payload);
  }

  private onRpcRequestError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/RPC_REQUEST_ERROR' }>
  ) {
    this.rpcRequestResolver?.reject(event.payload.message);
  }

  private onSessionUpdate(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SESSION_UPDATE' }>
  ) {
    const { payload } = event;
    if (payload) {
      // Ilja TODO: this.setSessionToken(payload.token)
    }
  }

  private onUpdateEmailSuccess(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/UPDATE_EMAIL_SUCCESS' }>
  ) {
    this.updateEmailResolver?.resolve(event.payload);
    this.setNewLastEmailLoginTime();
  }

  private onUpdateEmailError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/UPDATE_EMAIL_ERROR' }>
  ) {
    this.updateEmailResolver?.reject(event.payload.message);
  }

  private onUpdateEmailPrimaryOtpSuccess() {
    this.updateEmailPrimaryOtpResolver?.resolve(undefined);
  }

  private onUpdateEmailPrimaryOtpError(
    event: Extract<
      AppKitFrameTypes.FrameEvent,
      { type: '@w3m-frame/UPDATE_EMAIL_PRIMARY_OTP_ERROR' }
    >
  ) {
    this.updateEmailPrimaryOtpResolver?.reject(event.payload.message);
  }

  private onUpdateEmailSecondaryOtpSuccess(
    event: Extract<
      AppKitFrameTypes.FrameEvent,
      { type: '@w3m-frame/UPDATE_EMAIL_SECONDARY_OTP_SUCCESS' }
    >
  ) {
    const { newEmail } = event.payload;
    this.setEmailLoginSuccess(newEmail);
    this.updateEmailSecondaryOtpResolver?.resolve({ newEmail });
  }

  private onUpdateEmailSecondaryOtpError(
    event: Extract<
      AppKitFrameTypes.FrameEvent,
      { type: '@w3m-frame/UPDATE_EMAIL_SECONDARY_OTP_ERROR' }
    >
  ) {
    this.updateEmailSecondaryOtpResolver?.reject(event.payload.message);
  }

  private onSyncThemeSuccess() {
    this.syncThemeResolver?.resolve(undefined);
  }

  private onSyncThemeError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SYNC_THEME_ERROR' }>
  ) {
    this.syncThemeResolver?.reject(event.payload.message);
  }

  private onSyncDappDataSuccess() {
    this.syncDappDataResolver?.resolve(undefined);
  }

  private onSyncDappDataError(
    event: Extract<AppKitFrameTypes.FrameEvent, { type: '@w3m-frame/SYNC_DAPP_DATA_ERROR' }>
  ) {
    this.syncDappDataResolver?.reject(event.payload.message);
  }

  // -- Private Methods -------------------------------------------------
  private setNewLastEmailLoginTime() {
    AppKitFrameStorage.set(AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString());
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

  private onAppEvent(
    event: AppKitFrameTypes.AppEvent,
    callback: (event: AppKitFrameTypes.AppEvent) => void
  ) {
    if (!event.type?.includes(AppKitFrameConstants.APP_EVENT_KEY)) {
      return;
    }
    const appEvent = AppKitFrameSchema.appEvent.parse(event);
    callback(appEvent);
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
