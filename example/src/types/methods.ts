import type { ethers } from 'ethers';

export interface IFormattedRpcResponse {
  method: string;
  address: string;
  valid: boolean;
  result: string;
}

export interface AccountAction {
  method: string;
  callback: (web3Provider?: ethers.providers.Web3Provider) => Promise<any>;
}
