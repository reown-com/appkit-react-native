import { CoreHelperUtil } from '@reown/appkit-core-react-native';
import { AppKitFrameStorage } from './AppKitFrameStorage';
import { AppKitFrameConstants, AppKitFrameRpcConstants } from './AppKitFrameConstants';
import type { AppKitFrameTypes } from './AppKitFrameTypes';

const EMAIL_MINIMUM_TIMEOUT = 30 * 1000;

export const AppKitFrameHelpers = {
  getBlockchainApiUrl() {
    return CoreHelperUtil.getBlockchainApiUrl();
  },

  async checkIfAllowedToTriggerEmail() {
    const lastEmailLoginTime = await AppKitFrameStorage.get(
      AppKitFrameConstants.LAST_EMAIL_LOGIN_TIME
    );
    if (lastEmailLoginTime) {
      const difference = Date.now() - Number(lastEmailLoginTime);
      if (difference < EMAIL_MINIMUM_TIMEOUT) {
        const cooldownSec = Math.ceil((EMAIL_MINIMUM_TIMEOUT - difference) / 1000);
        throw new Error(`Please try again after ${cooldownSec} seconds`);
      }
    }
  },

  checkIfRequestExists(request: unknown) {
    const method = this.getRequestMethod(request);

    return (
      AppKitFrameRpcConstants.NOT_SAFE_RPC_METHODS.includes(method) ||
      AppKitFrameRpcConstants.SAFE_RPC_METHODS.includes(method)
    );
  },

  getRequestMethod(request: unknown) {
    return (request as { payload: AppKitFrameTypes.RPCRequest })?.payload?.method;
  },

  checkIfRequestIsAllowed(request: unknown) {
    const method = this.getRequestMethod(request);

    return AppKitFrameRpcConstants.SAFE_RPC_METHODS.includes(method);
  }
};
