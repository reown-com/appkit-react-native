import type { CaipNetworkId } from '../common';
import type {
  SIWESession,
  SIWECreateMessageArgs,
  SIWEMessageArgs,
  SIWEVerifyMessageArgs,
  SIWXSession,
  SIWXMessage
} from './message';

export interface SIWEClientMethods {
  getNonce: (address?: string) => Promise<string>;
  createMessage: (args: SIWECreateMessageArgs) => string;
  verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>;
  getSession: () => Promise<SIWESession | null>;
  signOut: () => Promise<boolean>;
  getMessageParams?: () => Promise<SIWEMessageArgs>;
  onSignIn?: (session?: SIWESession) => void;
  onSignOut?: () => void;
}

export interface SIWEConfig extends SIWEClientMethods {
  // Defaults to true
  enabled?: boolean;
  // In milliseconds, defaults to 5 minutes
  nonceRefetchIntervalMs?: number;
  // In milliseconds, defaults to 5 minutes
  sessionRefetchIntervalMs?: number;
  // Defaults to true
  signOutOnDisconnect?: boolean;
  // Defaults to true
  signOutOnAccountChange?: boolean;
  // Defaults to true
  signOutOnNetworkChange?: boolean;
}

export interface AppKitSIWEClient extends SIWEClientMethods {
  signIn: () => Promise<SIWESession | undefined>;
  options: {
    enabled: boolean;
    nonceRefetchIntervalMs: number;
    sessionRefetchIntervalMs: number;
    signOutOnDisconnect: boolean;
    signOutOnAccountChange: boolean;
    signOutOnNetworkChange: boolean;
  };
}

/**
 * This interface represents the SIWX configuration plugin, which is used to create and manage SIWX messages and sessions.
 * AppKit provides predefined implementations for this interface through `@reown/appkit-siwx-react-native`.
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
   * This method determines whether the session should be cleared when the user disconnects.
   *
   * @default true
   * @returns {boolean}
   */
  signOutOnDisconnect?: boolean;
  domain?: string;
  uri?: string;
}
