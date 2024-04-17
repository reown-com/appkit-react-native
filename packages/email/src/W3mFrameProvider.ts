import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { W3mFrameTypes } from './W3mFrameTypes';
import { W3mFrameConstants, W3mFrameRpcConstants } from './W3mFrameConstants';
import { W3mFrameStorage } from './W3mFrameStorage';
import { W3mFrameHelpers } from './W3mFrameHelpers';
import { W3mFrameSchema } from './W3mFrameSchema';

// -- Types -----------------------------------------------------------
type Resolver<T> = { resolve: (value: T) => void; reject: (reason?: unknown) => void } | undefined;
type ConnectEmailResolver = Resolver<W3mFrameTypes.Responses['FrameConnectEmailResponse']>;
type ConnectDeviceResolver = Resolver<undefined>;
type ConnectOtpResolver = Resolver<undefined>;
type ConnectResolver = Resolver<W3mFrameTypes.Responses['FrameGetUserResponse']>;
type DisconnectResolver = Resolver<undefined>;
type IsConnectedResolver = Resolver<W3mFrameTypes.Responses['FrameIsConnectedResponse']>;
type GetChainIdResolver = Resolver<W3mFrameTypes.Responses['FrameGetChainIdResponse']>;
type SwitchChainResolver = Resolver<W3mFrameTypes.Responses['FrameSwitchNetworkResponse']>;
type RpcRequestResolver = Resolver<W3mFrameTypes.RPCResponse>;
type UpdateEmailResolver = Resolver<W3mFrameTypes.Responses['FrameUpdateEmailResponse']>;
type UpdateEmailPrimaryOtpResolver = Resolver<undefined>;
type UpdateEmailSecondaryOtpResolver = Resolver<
  W3mFrameTypes.Responses['FrameUpdateEmailSecondaryOtpResolver']
>;
type SyncThemeResolver = Resolver<undefined>;
type SyncDappDataResolver = Resolver<undefined>;
type SmartAccountEnabledNetworksResolver = Resolver<
  W3mFrameTypes.Responses['FrameGetSmartAccountEnabledNetworksResponse']
>;
type InitSmartAccountResolver = Resolver<W3mFrameTypes.Responses['FrameInitSmartAccountResponse']>;
type SetPreferredAccountResolver = Resolver<undefined>;

type Metadata = {
  name: string;
  description: string;
  url: string;
  icons: string[];
};

// -- Provider --------------------------------------------------------
export class W3mFrameProvider {
  private webviewRef: RefObject<WebView> | undefined;

  private projectId: string;

  private metadata: Metadata | undefined;

  private email: string | undefined;

  public webviewLoadPromise: Promise<void>;

  public webviewLoadPromiseResolver:
    | {
        resolve: (value: undefined) => void;
        reject: (reason?: unknown) => void;
      }
    | undefined;

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

  private smartAccountEnabledNetworksResolver: SmartAccountEnabledNetworksResolver = undefined;

  private initSmartAccountResolver: InitSmartAccountResolver = undefined;

  private setPreferredAccountResolver: SetPreferredAccountResolver = undefined;

  public constructor(projectId: string, metadata: Metadata) {
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

  public onMessage(e: W3mFrameTypes.FrameEvent) {
    this.onFrameEvent(e, event => {
      console.log('💻 received', e); // eslint-disable-line no-console
      switch (event.type) {
        case W3mFrameConstants.FRAME_CONNECT_EMAIL_SUCCESS:
          return this.onConnectEmailSuccess(event);
        case W3mFrameConstants.FRAME_CONNECT_EMAIL_ERROR:
          return this.onConnectEmailError(event);
        case W3mFrameConstants.FRAME_CONNECT_DEVICE_SUCCESS:
          return this.onConnectDeviceSuccess();
        case W3mFrameConstants.FRAME_CONNECT_DEVICE_ERROR:
          return this.onConnectDeviceError(event);
        case W3mFrameConstants.FRAME_CONNECT_OTP_SUCCESS:
          return this.onConnectOtpSuccess();
        case W3mFrameConstants.FRAME_CONNECT_OTP_ERROR:
          return this.onConnectOtpError(event);
        case W3mFrameConstants.FRAME_GET_USER_SUCCESS:
          return this.onConnectSuccess(event);
        case W3mFrameConstants.FRAME_GET_USER_ERROR:
          return this.onConnectError(event);
        case W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS:
          return this.onIsConnectedSuccess(event);
        case W3mFrameConstants.FRAME_IS_CONNECTED_ERROR:
          return this.onIsConnectedError(event);
        case W3mFrameConstants.FRAME_GET_CHAIN_ID_SUCCESS:
          return this.onGetChainIdSuccess(event);
        case W3mFrameConstants.FRAME_GET_CHAIN_ID_ERROR:
          return this.onGetChainIdError(event);
        case W3mFrameConstants.FRAME_SIGN_OUT_SUCCESS:
          return this.onSignOutSuccess();
        case W3mFrameConstants.FRAME_SIGN_OUT_ERROR:
          return this.onSignOutError(event);
        case W3mFrameConstants.FRAME_SWITCH_NETWORK_SUCCESS:
          return this.onSwitchChainSuccess(event);
        case W3mFrameConstants.FRAME_SWITCH_NETWORK_ERROR:
          return this.onSwitchChainError(event);
        case W3mFrameConstants.FRAME_RPC_REQUEST_SUCCESS:
          return this.onRpcRequestSuccess(event);
        case W3mFrameConstants.FRAME_RPC_REQUEST_ERROR:
          return this.onRpcRequestError(event);
        case W3mFrameConstants.FRAME_SESSION_UPDATE:
          return this.onSessionUpdate(event);
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_SUCCESS:
          return this.onUpdateEmailSuccess(event);
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_ERROR:
          return this.onUpdateEmailError(event);
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_SUCCESS:
          return this.onUpdateEmailPrimaryOtpSuccess();
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_ERROR:
          return this.onUpdateEmailPrimaryOtpError(event);
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_SUCCESS:
          return this.onUpdateEmailSecondaryOtpSuccess(event);
        case W3mFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_ERROR:
          return this.onUpdateEmailSecondaryOtpError(event);
        case W3mFrameConstants.FRAME_SYNC_THEME_SUCCESS:
          return this.onSyncThemeSuccess();
        case W3mFrameConstants.FRAME_SYNC_THEME_ERROR:
          return this.onSyncThemeError(event);
        case W3mFrameConstants.FRAME_SYNC_DAPP_DATA_SUCCESS:
          return this.onSyncDappDataSuccess();
        case W3mFrameConstants.FRAME_SYNC_DAPP_DATA_ERROR:
          return this.onSyncDappDataError(event);
        case W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS:
          return this.onSmartAccountEnabledNetworksSuccess(event);
        case W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR:
          return this.onSmartAccountEnabledNetworksError(event);
        case W3mFrameConstants.FRAME_INIT_SMART_ACCOUNT_SUCCESS:
          return this.onInitSmartAccountSuccess(event);
        case W3mFrameConstants.FRAME_INIT_SMART_ACCOUNT_ERROR:
          return this.onInitSmartAccountError(event);
        case W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_SUCCESS:
          return this.onPreferSmartAccountSuccess(event);
        case W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_ERROR:
          return this.onPreferSmartAccountError();

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
    return `${W3mFrameConstants.SECURE_SITE_SDK}?projectId=${this.projectId}`;
  }

  public async getLoginEmailUsed() {
    const email = await W3mFrameStorage.get(W3mFrameConstants.EMAIL_LOGIN_USED_KEY);

    return Boolean(email);
  }

  public getEmail() {
    return this.email;
  }

  public rejectRpcRequest() {
    this.rpcRequestResolver?.reject();
  }

  public async connectEmail(payload: W3mFrameTypes.Requests['AppConnectEmailRequest']) {
    await this.webviewLoadPromise;
    await W3mFrameHelpers.checkIfAllowedToTriggerEmail();
    this.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_EMAIL, payload });

    return new Promise<W3mFrameTypes.Responses['FrameConnectEmailResponse']>((resolve, reject) => {
      this.connectEmailResolver = { resolve, reject };
    });
  }

  public async connectDevice() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_DEVICE });

    return new Promise((resolve, reject) => {
      this.connectDeviceResolver = { resolve, reject };
    });
  }

  public async connectOtp(payload: W3mFrameTypes.Requests['AppConnectOtpRequest']) {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_OTP, payload });

    return new Promise((resolve, reject) => {
      this.connectOtpResolver = { resolve, reject };
    });
  }

  public async isConnected() {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_IS_CONNECTED,
      payload: undefined
    });

    return new Promise<W3mFrameTypes.Responses['FrameIsConnectedResponse']>((resolve, reject) => {
      this.isConnectedResolver = { resolve, reject };
    });
  }

  public async getChainId() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_GET_CHAIN_ID });

    return new Promise<W3mFrameTypes.Responses['FrameGetChainIdResponse']>((resolve, reject) => {
      this.getChainIdResolver = { resolve, reject };
    });
  }

  public async updateEmail(payload: W3mFrameTypes.Requests['AppUpdateEmailRequest']) {
    await this.webviewLoadPromise;
    await W3mFrameHelpers.checkIfAllowedToTriggerEmail();
    this.postAppEvent({ type: W3mFrameConstants.APP_UPDATE_EMAIL, payload });

    return new Promise<W3mFrameTypes.Responses['FrameUpdateEmailResponse']>((resolve, reject) => {
      this.updateEmailResolver = { resolve, reject };
    });
  }

  public async updateEmailPrimaryOtp(
    payload: W3mFrameTypes.Requests['AppUpdateEmailPrimaryOtpRequest']
  ) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_UPDATE_EMAIL_PRIMARY_OTP,
      payload
    });

    return new Promise((resolve, reject) => {
      this.updateEmailPrimaryOtpResolver = { resolve, reject };
    });
  }

  public async updateEmailSecondaryOtp(
    payload: W3mFrameTypes.Requests['AppUpdateEmailSecondaryOtpRequest']
  ) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_UPDATE_EMAIL_SECONDARY_OTP,
      payload
    });

    return new Promise<W3mFrameTypes.Responses['FrameUpdateEmailSecondaryOtpResolver']>(
      (resolve, reject) => {
        this.updateEmailSecondaryOtpResolver = { resolve, reject };
      }
    );
  }

  public async syncTheme(payload: W3mFrameTypes.Requests['AppSyncThemeRequest']) {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_SYNC_THEME, payload });

    return new Promise((resolve, reject) => {
      this.syncThemeResolver = { resolve, reject };
    });
  }

  public async syncDappData(payload: W3mFrameTypes.Requests['AppSyncDappDataRequest']) {
    await this.webviewLoadPromise;
    const metadata = payload.metadata ?? this.metadata;
    this.postAppEvent({
      type: W3mFrameConstants.APP_SYNC_DAPP_DATA,
      payload: { ...payload, metadata }
    });

    return new Promise((resolve, reject) => {
      this.syncDappDataResolver = { resolve, reject };
    });
  }

  public async getSmartAccountEnabledNetworks() {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_GET_SMART_ACCOUNT_ENABLED_NETWORKS
    });

    return new Promise<W3mFrameTypes.Responses['FrameGetSmartAccountEnabledNetworksResponse']>(
      (resolve, reject) => {
        this.smartAccountEnabledNetworksResolver = { resolve, reject };
      }
    );
  }

  public async initSmartAccount() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_INIT_SMART_ACCOUNT });

    return new Promise<W3mFrameTypes.Responses['FrameInitSmartAccountResponse']>(
      (resolve, reject) => {
        this.initSmartAccountResolver = { resolve, reject };
      }
    );
  }

  public async setPreferredAccount(type: 'eoa' | 'smartAccount') {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_SET_PREFERRED_ACCOUNT,
      payload: { type }
    });

    return new Promise((resolve, reject) => {
      this.setPreferredAccountResolver = { resolve, reject };
    });
  }

  // -- Provider Methods ------------------------------------------------
  public async connect(payload?: W3mFrameTypes.Requests['AppGetUserRequest']) {
    const lastUsedChain = await this.getLastUsedChainId();
    const chainId = payload?.chainId ?? lastUsedChain ?? 1;
    await this.webviewLoadPromise;

    this.postAppEvent({
      type: W3mFrameConstants.APP_GET_USER,
      payload: { chainId }
    });

    return new Promise<W3mFrameTypes.Responses['FrameGetUserResponse']>((resolve, reject) => {
      this.connectResolver = { resolve, reject };
    });
  }

  public async switchNetwork(chainId: number) {
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_SWITCH_NETWORK,
      payload: { chainId }
    });

    return new Promise<W3mFrameTypes.Responses['FrameSwitchNetworkResponse']>((resolve, reject) => {
      this.switchChainResolver = { resolve, reject };
    });
  }

  public async disconnect() {
    await this.webviewLoadPromise;
    this.postAppEvent({ type: W3mFrameConstants.APP_SIGN_OUT });

    return new Promise((resolve, reject) => {
      this.disconnectResolver = { resolve, reject };
    });
  }

  public async request(req: W3mFrameTypes.RPCRequest) {
    if (W3mFrameRpcConstants.GET_CHAIN_ID === req.method) {
      return await this.getLastUsedChainId();
    }
    await this.webviewLoadPromise;
    this.postAppEvent({
      type: W3mFrameConstants.APP_RPC_REQUEST,
      payload: req
    });

    return new Promise<W3mFrameTypes.RPCResponse>((resolve, reject) => {
      this.rpcRequestResolver = { resolve, reject };
    });
  }

  public onRpcRequest(event: W3mFrameTypes.AppEvent, callback: (request: unknown) => void) {
    this.onAppEvent(event, appEvent => {
      if (appEvent.type.includes(W3mFrameConstants.RPC_METHOD_KEY)) {
        callback(appEvent);
      }
    });
  }

  public onRpcResponse(event: W3mFrameTypes.FrameEvent, callback: (request: unknown) => void) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type.includes(W3mFrameConstants.RPC_METHOD_KEY)) {
        callback(frameEvent);
      }
    });
  }

  public onIsConnected(event: W3mFrameTypes.FrameEvent, callback: () => void) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type === W3mFrameConstants.FRAME_GET_USER_SUCCESS) {
        callback();
      }
    });
  }

  public onNotConnected(event: W3mFrameTypes.FrameEvent, callback: () => void) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type === W3mFrameConstants.FRAME_IS_CONNECTED_ERROR) {
        callback();
      }
      if (
        frameEvent.type === W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS &&
        !frameEvent.payload.isConnected
      ) {
        callback();
      }
    });
  }

  public onInitSmartAccount(
    event: W3mFrameTypes.FrameEvent,
    callback: (isDeployed: boolean) => void
  ) {
    this.onFrameEvent(event, frameEvent => {
      if (frameEvent.type === W3mFrameConstants.FRAME_INIT_SMART_ACCOUNT_SUCCESS) {
        callback(frameEvent.payload.isDeployed);
      } else if (frameEvent.type === W3mFrameConstants.FRAME_INIT_SMART_ACCOUNT_ERROR) {
        callback(false);
      }
    });
  }

  // -- Promise Handlers ------------------------------------------------
  private onConnectEmailSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_SUCCESS' }>
  ) {
    this.connectEmailResolver?.resolve(event.payload);
    this.setNewLastEmailLoginTime();
  }

  private onConnectEmailError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_EMAIL_ERROR' }>
  ) {
    this.connectEmailResolver?.reject(event.payload.message);
  }

  private onConnectDeviceSuccess() {
    this.connectDeviceResolver?.resolve(undefined);
  }

  private onConnectDeviceError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_DEVICE_ERROR' }>
  ) {
    this.connectDeviceResolver?.reject(event.payload.message);
  }

  private onConnectOtpSuccess() {
    this.connectOtpResolver?.resolve(undefined);
  }

  private onConnectOtpError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/CONNECT_OTP_ERROR' }>
  ) {
    this.connectOtpResolver?.reject(event.payload.message);
  }

  private onConnectSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_SUCCESS' }>
  ) {
    this.setEmailLoginSuccess(event.payload.email);
    this.setLastUsedChainId(event.payload.chainId);
    this.connectResolver?.resolve(event.payload);
  }

  private onConnectError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_USER_ERROR' }>
  ) {
    this.connectResolver?.reject(event.payload.message);
  }

  private onIsConnectedSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_SUCCESS' }>
  ) {
    if (!event.payload.isConnected) {
      this.deleteEmailLoginCache();
    }
    this.isConnectedResolver?.resolve(event.payload);
  }

  private onIsConnectedError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/IS_CONNECTED_ERROR' }>
  ) {
    this.isConnectedResolver?.reject(event.payload.message);
  }

  private onGetChainIdSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_SUCCESS' }>
  ) {
    this.setLastUsedChainId(event.payload.chainId);
    this.getChainIdResolver?.resolve(event.payload);
  }

  private onGetChainIdError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/GET_CHAIN_ID_ERROR' }>
  ) {
    this.getChainIdResolver?.reject(event.payload.message);
  }

  private onSignOutSuccess() {
    this.disconnectResolver?.resolve(undefined);
    this.deleteEmailLoginCache();
  }

  private onSignOutError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SIGN_OUT_ERROR' }>
  ) {
    this.disconnectResolver?.reject(event.payload.message);
  }

  private onSwitchChainSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SWITCH_NETWORK_SUCCESS' }>
  ) {
    this.setLastUsedChainId(event.payload.chainId);
    this.switchChainResolver?.resolve(event.payload);
  }

  private onSwitchChainError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SWITCH_NETWORK_ERROR' }>
  ) {
    this.switchChainResolver?.reject(event.payload.message);
  }

  private onRpcRequestSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/RPC_REQUEST_SUCCESS' }>
  ) {
    this.rpcRequestResolver?.resolve(event.payload);
  }

  private onRpcRequestError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/RPC_REQUEST_ERROR' }>
  ) {
    this.rpcRequestResolver?.reject(event.payload.message);
  }

  private onSessionUpdate(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SESSION_UPDATE' }>
  ) {
    const { payload } = event;
    if (payload) {
      // Ilja TODO: this.setSessionToken(payload.token)
    }
  }

  private onUpdateEmailSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/UPDATE_EMAIL_SUCCESS' }>
  ) {
    this.updateEmailResolver?.resolve(event.payload);
    this.setNewLastEmailLoginTime();
  }

  private onUpdateEmailError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/UPDATE_EMAIL_ERROR' }>
  ) {
    this.updateEmailResolver?.reject(event.payload.message);
  }

  private onUpdateEmailPrimaryOtpSuccess() {
    this.updateEmailPrimaryOtpResolver?.resolve(undefined);
  }

  private onUpdateEmailPrimaryOtpError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/UPDATE_EMAIL_PRIMARY_OTP_ERROR' }>
  ) {
    this.updateEmailPrimaryOtpResolver?.reject(event.payload.message);
  }

  private onUpdateEmailSecondaryOtpSuccess(
    event: Extract<
      W3mFrameTypes.FrameEvent,
      { type: '@w3m-frame/UPDATE_EMAIL_SECONDARY_OTP_SUCCESS' }
    >
  ) {
    const { newEmail } = event.payload;
    this.setEmailLoginSuccess(newEmail);
    this.updateEmailSecondaryOtpResolver?.resolve({ newEmail });
  }

  private onUpdateEmailSecondaryOtpError(
    event: Extract<
      W3mFrameTypes.FrameEvent,
      { type: '@w3m-frame/UPDATE_EMAIL_SECONDARY_OTP_ERROR' }
    >
  ) {
    this.updateEmailSecondaryOtpResolver?.reject(event.payload.message);
  }

  private onSyncThemeSuccess() {
    this.syncThemeResolver?.resolve(undefined);
  }

  private onSyncThemeError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SYNC_THEME_ERROR' }>
  ) {
    this.syncThemeResolver?.reject(event.payload.message);
  }

  private onSyncDappDataSuccess() {
    this.syncDappDataResolver?.resolve(undefined);
  }

  private onSyncDappDataError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SYNC_DAPP_DATA_ERROR' }>
  ) {
    this.syncDappDataResolver?.reject(event.payload.message);
  }

  private onSmartAccountEnabledNetworksSuccess(
    event: Extract<
      W3mFrameTypes.FrameEvent,
      { type: '@w3m-frame/GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS' }
    >
  ) {
    this.smartAccountEnabledNetworksResolver?.resolve(event.payload);
  }

  private onSmartAccountEnabledNetworksError(
    event: Extract<
      W3mFrameTypes.FrameEvent,
      { type: '@w3m-frame/GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR' }
    >
  ) {
    this.smartAccountEnabledNetworksResolver?.reject(event.payload.message);
  }

  private onInitSmartAccountSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/INIT_SMART_ACCOUNT_SUCCESS' }>
  ) {
    this.initSmartAccountResolver?.resolve(event.payload);
  }

  private onInitSmartAccountError(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/INIT_SMART_ACCOUNT_ERROR' }>
  ) {
    this.initSmartAccountResolver?.reject(event.payload.message);
  }

  private onPreferSmartAccountSuccess(
    event: Extract<W3mFrameTypes.FrameEvent, { type: '@w3m-frame/SET_PREFERRED_ACCOUNT_SUCCESS' }>
  ) {
    this.persistPreferredAccount(event.payload.type as 'eoa' | 'smartAccount');
    this.setPreferredAccountResolver?.resolve(undefined);
  }

  private onPreferSmartAccountError() {
    this.setPreferredAccountResolver?.reject();
  }

  // -- Private Methods -------------------------------------------------
  private setNewLastEmailLoginTime() {
    W3mFrameStorage.set(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString());
  }

  private setEmailLoginSuccess(email: string) {
    W3mFrameStorage.set(W3mFrameConstants.EMAIL, email);
    W3mFrameStorage.set(W3mFrameConstants.EMAIL_LOGIN_USED_KEY, 'true');
    W3mFrameStorage.delete(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME);
    this.email = email;
  }

  private deleteEmailLoginCache() {
    W3mFrameStorage.delete(W3mFrameConstants.EMAIL_LOGIN_USED_KEY);
    W3mFrameStorage.delete(W3mFrameConstants.EMAIL);
    W3mFrameStorage.delete(W3mFrameConstants.LAST_USED_CHAIN_KEY);
    this.email = undefined;
  }

  private setLastUsedChainId(chainId: number) {
    W3mFrameStorage.set(W3mFrameConstants.LAST_USED_CHAIN_KEY, String(chainId));
  }

  private async getLastUsedChainId() {
    const chainId = await W3mFrameStorage.get(W3mFrameConstants.LAST_USED_CHAIN_KEY);
    if (chainId) {
      return Number(chainId);
    }

    return undefined;
  }

  private persistPreferredAccount(type: 'eoa' | 'smartAccount') {
    W3mFrameStorage.set(W3mFrameConstants.PREFERRED_ACCOUNT_TYPE, type);
  }

  private onFrameEvent(
    event: W3mFrameTypes.FrameEvent,
    callback: (event: W3mFrameTypes.FrameEvent) => void
  ) {
    if (
      !event.type?.includes(W3mFrameConstants.FRAME_EVENT_KEY) ||
      event.origin !== W3mFrameConstants.SECURE_SITE_ORIGIN
    ) {
      return;
    }
    const frameEvent = W3mFrameSchema.frameEvent.parse(event);
    callback(frameEvent);
  }

  private onAppEvent(
    event: W3mFrameTypes.AppEvent,
    callback: (event: W3mFrameTypes.AppEvent) => void
  ) {
    if (!event.type?.includes(W3mFrameConstants.APP_EVENT_KEY)) {
      return;
    }
    const appEvent = W3mFrameSchema.appEvent.parse(event);
    callback(appEvent);
  }

  private postAppEvent(event: W3mFrameTypes.AppEvent) {
    if (!this.webviewRef?.current) {
      throw new Error('W3mFrameProvider: webviewRef is not set');
    }

    W3mFrameSchema.appEvent.parse(event);
    const strEvent = JSON.stringify(event);
    console.log('📡 sending', strEvent); // eslint-disable-line no-console
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
    const email = await W3mFrameStorage.get(W3mFrameConstants.EMAIL);

    return email;
  }
}
