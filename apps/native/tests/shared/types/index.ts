export interface SessionParams {
  reqAccounts: string[];
  optAccounts: string[];
  accept: boolean;
}

export type TimingRecords = { item: string; timeMs: number }[];

export type CaipNetworkId = `${string}:${string}`;
