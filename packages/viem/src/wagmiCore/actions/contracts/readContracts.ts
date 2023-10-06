import type { Narrow } from 'abitype';
import type {
  ContractFunctionConfig,
  MulticallContracts,
  MulticallParameters,
  PublicClient
} from 'viem';
import { ContractFunctionExecutionError } from 'viem';

import type { MulticallConfig, MulticallResult } from './multicall';
import { multicall } from './multicall';

export type ReadContractsConfig<
  TContracts extends ContractFunctionConfig[],
  TAllowFailure extends boolean = true
> = Omit<MulticallConfig<TContracts, TAllowFailure>, 'contracts' | 'chainId'> & {
  /** Contracts to query */
  contracts: Narrow<
    readonly [
      ...MulticallContracts<
        TContracts,
        {
          /** Chain id to use for Public Client. */
          chainId?: number;
        }
      >
    ]
  >;
  publicClient: PublicClient;
};

export type ReadContractsResult<
  TContracts extends ContractFunctionConfig[],
  TAllowFailure extends boolean = true
> = MulticallResult<TContracts, TAllowFailure>;

export async function readContracts<
  TContracts extends ContractFunctionConfig[],
  TAllowFailure extends boolean = true
>({
  contracts,
  blockNumber,
  blockTag,
  publicClient,
  ...args
}: ReadContractsConfig<TContracts, TAllowFailure>): Promise<
  ReadContractsResult<TContracts, TAllowFailure>
> {
  type ContractConfig = TContracts[number] & {
    chainId?: number;
  };

  const { allowFailure = true } = args;
  const defaultChainId = await publicClient.getChainId();

  try {
    const contractsByChainId = (contracts as unknown as ContractConfig[]).reduce<{
      [chainId: number]: {
        contract: ContractConfig;
        index: number;
      }[];
    }>((_contracts, contract, index) => {
      const chainId = contract.chainId ?? defaultChainId;

      return {
        ..._contracts,
        [chainId]: [...(_contracts[chainId] || []), { contract, index }]
      };
    }, {});
    const promises = () =>
      Object.entries(contractsByChainId).map(([chainId, _contracts]) =>
        multicall({
          allowFailure,
          // eslint-disable-next-line radix
          chainId: parseInt(chainId),
          contracts: _contracts.map(({ contract }) => contract) as MulticallParameters['contracts'],
          blockNumber,
          blockTag,
          publicClient
        })
      );

    const multicallResults = (await Promise.all(promises())).flat();

    // Reorder the contract results back to the order they were
    // provided in.
    const resultIndexes = Object.values(contractsByChainId).flatMap(_contracts =>
      _contracts.map(({ index }) => index)
    );

    return multicallResults.reduce((results, result, index) => {
      if (results) results[resultIndexes[index]!] = result;

      return results;
    }, [] as unknown[]) as ReadContractsResult<TContracts, TAllowFailure>;
  } catch (err) {
    if (err instanceof ContractFunctionExecutionError) throw err;

    const promises = () =>
      (contracts as unknown as ContractConfig[]).map(contract =>
        publicClient.readContract({ ...contract, blockNumber, blockTag })
      );
    if (allowFailure)
      return (await Promise.allSettled(promises())).map(result => {
        if (result.status === 'fulfilled') return { result: result.value, status: 'success' };

        return { error: result.reason, result: undefined, status: 'failure' };
      }) as ReadContractsResult<TContracts, TAllowFailure>;

    return (await Promise.all(promises())) as ReadContractsResult<TContracts, TAllowFailure>;
  }
}
