import type { CaipNetworkId } from '../common';
import type { SIWXSession, SIWXMessage } from './message';

/**
 * This interface represents the SIWX configuration plugin, which is used to create and manage SIWX messages and sessions.
 * You may use it to create a custom implementation following your needs, but watch close for the methods requirements.
 */
export interface SIWXConfig {
  /**
   * This method will be called to create a new message to be signed by the user.
   *
   * Constraints:
   * - The message MUST be unique and contain all the necessary information to verify the user's identity.
   * - SIWXMessage.toString() method MUST be implemented to return the message string.
   *
   * @param input SIWXMessage.Input
   * @returns SIWXMessage
   */
  createMessage: (input: SIWXMessage.Input) => Promise<SIWXMessage>;
  /**
   * This method will be called to store a new single session.
   *
   * Constraints:
   * - This method MUST verify if the session is valid and store it in the storage successfully.
   *
   * @param session SIWXSession
   */
  addSession: (session: SIWXSession) => Promise<void>;
  /**
   * This method will be called to revoke all the sessions stored for a specific chain and address.
   *
   * Constraints:
   * - This method MUST delete all the sessions stored for the specific chain and address successfully.
   *
   * @param chainId CaipNetworkId
   * @param address string
   */
  revokeSession: (chainId: CaipNetworkId, address: string) => Promise<void>;
  /**
   * This method will be called to replace all the sessions in the storage with the new ones.
   *
   * Constraints:
   * - This method MUST verify all the sessions before storing them in the storage;
   * - This method MUST replace all the sessions in the storage with the new ones succesfully otherwise it MUST throw an error.
   *
   * @param sessions SIWXSession[]
   */
  setSessions: (sessions: SIWXSession[]) => Promise<void>;
  /**
   * This method will be called to get all the sessions stored for a specific chain and address.
   *
   * Constraints:
   * - This method MUST return only sessions that are verified and valid;
   * - This method MUST NOT return expired sessions.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns
   */
  getSessions: (chainId: CaipNetworkId, address: string) => Promise<SIWXSession[]>;
  /**
   * This method determines whether the wallet stays connected when the user denies the signature request.
   *
   * @returns {boolean}
   */
  getRequired?: () => boolean;
  /**
   * This flag determines whether the session should be cleared when the user disconnects.
   *
   * @default true
   */
  signOutOnDisconnect?: boolean;
}
