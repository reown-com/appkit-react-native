export { formatMessage, getDidChainId, getDidAddress } from '@walletconnect/utils';
import type {
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
} from './utils/TypeUtils';
import { Web3ModalSIWEClient } from '../src/client';
export { getAddressFromMessage, getChainIdFromMessage, verifySignature } from './helpers/index';
export { SIWEController, type SIWEControllerClient } from './controller/SIWEController';

export type {
  Web3ModalSIWEClient,
  SIWEConfig,
  SIWESession,
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
  SIWEClientMethods
};

export function createSIWEConfig(siweConfig: SIWEConfig) {
  return new Web3ModalSIWEClient(siweConfig);
}

export * from './scaffold/partials/w3m-connecting-siwe/index';
export * from './scaffold/views/w3m-connecting-siwe-view/index';
