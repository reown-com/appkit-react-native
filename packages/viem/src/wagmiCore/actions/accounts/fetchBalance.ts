// Based on wagmi/core/src/actions/accounts/fetchBalance.ts

import type { Address, Chain, Hex, PublicClient } from 'viem';
import { ContractFunctionExecutionError, formatUnits, hexToString, trim } from 'viem';

import { erc20ABI, erc20ABI_bytes32 } from '../../constants';
import { readContracts } from '../contracts/readContracts';
import { getUnit, type Unit } from '../../utils/getUnits';

export type FetchBalanceArgs = {
  /** Address of balance to check */
  address: Address;
  /** Chain id to use for Public Client. */
  chainId?: number;
  /** Units for formatting output */
  formatUnits?: Unit;
  /** ERC-20 address */
  token?: Address;
  /** Public Client instance */
  publicClient: PublicClient;
  /** Chains to use for native currency */
  chains?: Chain[];
};

export type FetchBalanceResult = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
};

export async function fetchBalance({
  address,
  chainId,
  formatUnits: unit,
  token,
  publicClient,
  chains = []
}: FetchBalanceArgs): Promise<FetchBalanceResult> {
  // const config = getConfig();

  if (token) {
    type FetchContractBalance = {
      abi: typeof erc20ABI | typeof erc20ABI_bytes32;
    };
    const fetchContractBalance = async ({ abi }: FetchContractBalance) => {
      const erc20Config = { abi, address: token, chainId } as const;
      const [value, decimals, symbol] = await readContracts({
        allowFailure: false,
        contracts: [
          {
            ...erc20Config,
            functionName: 'balanceOf',
            args: [address]
          },
          { ...erc20Config, functionName: 'decimals' },
          { ...erc20Config, functionName: 'symbol' }
        ]
      });
      return {
        decimals,
        formatted: formatUnits(value ?? '0', getUnit(unit ?? decimals)),
        symbol: symbol as string, // protect against `ResolvedConfig['BytesType']`
        value
      };
    };

    try {
      return await fetchContractBalance({ abi: erc20ABI });
    } catch (err) {
      // In the chance that there is an error upon decoding the contract result,
      // it could be likely that the contract data is represented as bytes32 instead
      // of a string.
      if (err instanceof ContractFunctionExecutionError) {
        const { symbol, ...rest } = await fetchContractBalance({
          abi: erc20ABI_bytes32
        });
        return {
          symbol: hexToString(trim(symbol as Hex, { dir: 'right' })),
          ...rest
        };
      }
      throw err;
    }
  }

  const value = await publicClient.getBalance({ address });
  const _chainId = await publicClient.getChainId();
  const chain = chains.find(x => x.id === _chainId);
  return {
    decimals: chain?.nativeCurrency.decimals ?? 18,
    formatted: formatUnits(value ?? '0', getUnit(unit ?? 18)),
    symbol: chain?.nativeCurrency.symbol ?? 'ETH',
    value
  };
}
