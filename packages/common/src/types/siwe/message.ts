import type { CaipAddress, CaipNetworkId } from '../common';

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
