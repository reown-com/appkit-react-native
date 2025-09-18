import type { CaipAddress, CaipNetworkId } from '../common';

/**
 * This interface represents a SIWX session, which is used to store the user's identity information.
 */
export interface SIWXSession {
  data: SIWXMessage.Data;
  message: string;
  signature: string;
  cacao?: Cacao;
}
/**
 * This interface represents a SIWX message, which is used to create a message to be signed by the user.
 * This must contain the necessary information to verify the user's identity and how to generate the string message.
 */
export interface SIWXMessage extends SIWXMessage.Data, SIWXMessage.Methods {}
export declare namespace SIWXMessage {
  /**
   * This interface represents the SIWX message data, which is used to create a message to be signed by the user.
   */
  interface Data extends Input, Metadata, Identifier {}
  /**
   * This interface represents the SIWX message input.
   * Here must contain what is different for each user of the application.
   */
  interface Input {
    accountAddress: string;
    chainId: CaipNetworkId;
    notBefore?: Timestamp;
  }
  /**
   * This interface represents the SIWX message metadata.
   * Here must contain the main data related to the app.
   */
  interface Metadata {
    domain: string;
    uri: string;
    version: string;
    nonce: string;
    statement?: string;
    resources?: string[];
  }
  /**
   * This interface represents the SIWX message identifier.
   * Here must contain the request id and the timestamps.
   */
  interface Identifier {
    requestId?: string;
    issuedAt?: Timestamp;
    expirationTime?: Timestamp;
  }
  /**
   * This interface represents the SIWX message methods.
   * Here must contain the method to generate the message string and any other method performed by the SIWX message.
   */
  interface Methods {
    toString: () => string;
  }
  /**
   * The timestamp is a UTC string representing the time in ISO 8601 format.
   */
  type Timestamp = string;
}

export interface SIWESession {
  address: string;
  chainId: number;
}

interface CacaoHeader {
  t: 'caip122';
}

export interface SIWECreateMessageArgs {
  domain: string;
  nonce: string;
  uri: string;
  address: CaipAddress;
  version: '1';
  type?: CacaoHeader['t'];
  nbf?: string;
  exp?: string;
  statement?: string;
  requestId?: string;
  resources?: string[];
  expiry?: number;
  iat?: string;
}

export type SIWEMessageArgs = {
  chains: CaipNetworkId[];
  methods?: string[];
} & Omit<SIWECreateMessageArgs, 'address' | 'nonce' | 'version'>;

interface CacaoPayload {
  domain: string;
  aud: string;
  nonce: string;
  iss: string;
  version?: string;
  iat?: string;
  nbf?: string;
  exp?: string;
  statement?: string;
  requestId?: string;
  resources?: string[];
  type?: string;
}

interface Cacao {
  h: CacaoHeader;
  p: CacaoPayload;
  s: {
    t: 'eip191' | 'eip1271';
    s: string;
    m?: string;
  };
}

export interface SIWEVerifyMessageArgs {
  message: string;
  signature: string;
  cacao?: Cacao;
}
