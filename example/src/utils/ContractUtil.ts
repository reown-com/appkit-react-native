import { ethers } from 'ethers';

import CONTRACT_VALUES from '../constants/Contract';
import type { FormattedRpcResponse } from '../types/methods';

export const readContract = async (
  web3Provider?: ethers.providers.Web3Provider
): Promise<FormattedRpcResponse> => {
  if (!web3Provider) {
    throw new Error('web3Provider not connected');
  }

  const daiContract = new ethers.Contract(
    CONTRACT_VALUES.contractAddress,
    CONTRACT_VALUES.readContractAbi,
    web3Provider
  );

  // Read contract information
  const name = await daiContract.name();
  const symbol = await daiContract.symbol();
  const balance = await daiContract.balanceOf(CONTRACT_VALUES.balanceAddress);

  // Format the DAI for displaying to the user
  const formattedBalance = ethers.utils.formatUnits(balance, 18);

  return {
    method: 'readContract',
    address: CONTRACT_VALUES.contractAddress,
    valid: true,
    result: `name: ${name}, symbol: ${symbol}, balance: ${formattedBalance}`,
  };
};

export const getFilterChanges = async (
  web3Provider?: ethers.providers.Web3Provider
): Promise<FormattedRpcResponse> => {
  if (!web3Provider) {
    throw new Error('web3Provider not connected');
  }

  const daiContract = new ethers.Contract(
    CONTRACT_VALUES.contractAddress,
    CONTRACT_VALUES.getFilterChangesAbi,
    web3Provider
  );

  // Filter for all token transfers
  const filterFrom = daiContract.filters.Transfer?.(null, null);

  // List all transfers sent in the last 100 blocks
  const transfers = await daiContract.queryFilter(filterFrom!, -100);

  return {
    method: 'getFilterChanges',
    address: CONTRACT_VALUES.contractAddress,
    valid: true,
    result: `transfers: ${transfers.length}`,
  };
};

export const writeContract = async (
  web3Provider?: ethers.providers.Web3Provider
): Promise<FormattedRpcResponse> => {
  if (!web3Provider) {
    throw new Error('web3Provider not connected');
  }

  const daiContract = new ethers.Contract(
    CONTRACT_VALUES.contractAddress,
    CONTRACT_VALUES.writeContractAbi,
    web3Provider
  );
  const daiWithSigner = daiContract.connect(web3Provider.getSigner());
  const myAddress = await web3Provider.getSigner().getAddress();

  // Each DAI has 18 decimal places
  const dai = ethers.utils.parseUnits('0.001', 18);

  // Send 0.001 DAI to myself
  const tx = await daiWithSigner.transfer(myAddress, dai);

  return {
    method: 'writeContract',
    address: myAddress,
    valid: true,
    result: tx.hash,
  };
};
