import { TEST_CHAINS } from '../constants';

export interface SessionParams {
  reqAccounts: string[];
  optAccounts: string[];
  accept: boolean;
}

export type TimingRecords = { item: string; timeMs: number }[];

export type CaipNetworkId = `${string}:${string}`;

export type SupportedChain = (typeof TEST_CHAINS)[keyof typeof TEST_CHAINS];
