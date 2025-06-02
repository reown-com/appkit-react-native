import {
  AccountController,
  ConnectionController,
  RouterUtil,
  ConnectionsController
} from '@reown/appkit-core-react-native';
import { NetworkUtil } from '@reown/appkit-common-react-native';

import type {
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEConfig,
  SIWEClientMethods,
  SIWESession,
  SIWEMessageArgs
} from './utils/TypeUtils';
import type { SIWEControllerClient } from './controller/SIWEController';

import { ConstantsUtil } from './utils/ConstantsUtil';

// -- Client -------------------------------------------------------------------- //
export class AppKitSIWEClient {
  public options: SIWEControllerClient['options'];

  public methods: SIWEClientMethods;

  public constructor(siweConfig: SIWEConfig) {
    const {
      enabled = true,
      nonceRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      sessionRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      signOutOnAccountChange = true,
      signOutOnDisconnect = true,
      signOutOnNetworkChange = true,
      ...siweConfigMethods
    } = siweConfig;

    this.options = {
      // Default options
      enabled,
      nonceRefetchIntervalMs,
      sessionRefetchIntervalMs,
      signOutOnDisconnect,
      signOutOnAccountChange,
      signOutOnNetworkChange
    };

    this.methods = siweConfigMethods;
  }

  async getNonce(address?: string) {
    const nonce = await this.methods.getNonce(address);
    if (!nonce) {
      throw new Error('siweControllerClient:getNonce - nonce is undefined');
    }

    return nonce;
  }

  async getMessageParams?() {
    return ((await this.methods.getMessageParams?.()) || {}) as SIWEMessageArgs;
  }

  createMessage(args: SIWECreateMessageArgs) {
    const message = this.methods.createMessage(args);

    if (!message) {
      throw new Error('siweControllerClient:createMessage - message is undefined');
    }

    return message;
  }

  async verifyMessage(args: SIWEVerifyMessageArgs) {
    const isValid = await this.methods.verifyMessage(args);

    return isValid;
  }

  async getSession() {
    const session = await this.methods.getSession();
    if (!session) {
      throw new Error('siweControllerClient:getSession - session is undefined');
    }

    return session;
  }

  async signIn(): Promise<SIWESession> {
    const { address } = AccountController.state;
    const nonce = await this.getNonce(address);
    if (!address) {
      throw new Error('An address is required to create a SIWE message.');
    }
    const chainId = NetworkUtil.caipNetworkIdToNumber(
      ConnectionsController.state.activeNetwork?.caipNetworkId
    );
    if (!chainId) {
      throw new Error('A chainId is required to create a SIWE message.');
    }
    const messageParams = await this.getMessageParams?.();
    const message = this.createMessage({
      address: `eip155:${chainId}:${address}`,
      chainId,
      nonce,
      version: '1',
      iat: messageParams?.iat || new Date().toISOString(),
      ...messageParams!
    });

    const signature = await ConnectionController.signMessage(message);
    const isValid = await this.verifyMessage({ message, signature });
    if (!isValid) {
      throw new Error('Error verifying SIWE signature');
    }

    const session = await this.getSession();
    if (!session) {
      throw new Error('Error getting SIWE session');
    }
    if (this.methods.onSignIn) {
      this.methods.onSignIn(session);
    }

    RouterUtil.navigateAfterNetworkSwitch();

    return session;
  }

  async signOut() {
    this.methods.onSignOut?.();

    return this.methods.signOut();
  }
}
