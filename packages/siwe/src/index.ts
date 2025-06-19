import type { SIWEConfig } from '@reown/appkit-common-react-native';
export { formatMessage, getDidChainId, getDidAddress } from '@walletconnect/utils';
export { getAddressFromMessage, getChainIdFromMessage, verifySignature } from './helpers/index';
export { SIWEController, type SIWEControllerClient } from './controller/SIWEController';

import { AppKitSIWEClient } from './client';

export type { AppKitSIWEClient };

export type {
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
} from '@reown/appkit-common-react-native';

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new AppKitSIWEClient(siweConfig);
}
