import type {
  ContractFunctionConfig,
  MulticallParameters,
  MulticallReturnType,
  PublicClient
} from 'viem';

// import { ChainNotConfiguredError, ConfigChainsNotFound } from '../../errors'

export type MulticallConfig<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true
> = MulticallParameters<TContracts, TAllowFailure> & {
  /** Chain id to use for Public Client. */
  chainId?: number;
  publicClient: PublicClient;
};

export type MulticallResult<
  TContracts extends ContractFunctionConfig[] = ContractFunctionConfig[],
  TAllowFailure extends boolean = true
> = MulticallReturnType<TContracts, TAllowFailure>;

export async function multicall<
  TContracts extends ContractFunctionConfig[],
  TAllowFailure extends boolean = true
>({
  chainId,
  contracts,
  blockNumber,
  blockTag,
  publicClient,
  ...args
}: MulticallConfig<TContracts, TAllowFailure>): Promise<
  MulticallResult<TContracts, TAllowFailure>
> {
  const _chainId = await publicClient.getChainId();

  if (chainId && _chainId !== chainId)
    throw new Error('Chain id does not match Public Client chain id');

  return publicClient.multicall({
    allowFailure: args.allowFailure ?? true,
    blockNumber,
    blockTag,
    contracts
  } as MulticallParameters<TContracts, TAllowFailure>);
}
