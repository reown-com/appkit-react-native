export { formatMessage, getDidChainId, getDidAddress } from '@walletconnect/utils';
import type {
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
} from './utils/TypeUtils';
import { AppKitSIWEClient } from './client';
export { getAddressFromMessage, getChainIdFromMessage, verifySignature } from './helpers/index';
export { SIWEController, type SIWEControllerClient } from './controller/SIWEController';

export type {
  AppKitSIWEClient,
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
};

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new AppKitSIWEClient(siweConfig);
}
