import { BlockchainApiController } from '../controllers/BlockchainApiController';
import { OptionsController } from '../controllers/OptionsController';
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiSwapAllowanceRequest,
  SwapTokenWithBalance
} from './TypeUtil';
import { AccountController } from '../controllers/AccountController';
import { ConnectionController } from '../controllers/ConnectionController';
import { ChainController } from '../controllers/ChainController';

export const SwapApiUtil = {
  async getTokenList() {
    const response = await BlockchainApiController.fetchSwapTokens({
      projectId: OptionsController.state.projectId,
      chainId: ChainController.state.activeCaipNetwork?.caipNetworkId
    });
    const tokens =
      response?.tokens?.map(
        token =>
          ({
            ...token,
            eip2612: false,
            quantity: {
              decimals: '0',
              numeric: '0'
            },
            price: 0,
            value: 0
          }) as SwapTokenWithBalance
      ) || [];

    return tokens;
  },

  async fetchSwapAllowance({
    tokenAddress,
    userAddress,
    sourceTokenAmount,
    sourceTokenDecimals
  }: Pick<BlockchainApiSwapAllowanceRequest, 'tokenAddress' | 'userAddress'> & {
    sourceTokenAmount: string;
    sourceTokenDecimals: number;
  }) {
    const projectId = OptionsController.state.projectId;

    const response = await BlockchainApiController.fetchSwapAllowance({
      projectId,
      tokenAddress,
      userAddress
    });

    if (response?.allowance && sourceTokenAmount && sourceTokenDecimals) {
      const parsedValue =
        ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals) || 0;
      const hasAllowance = BigInt(response.allowance) >= parsedValue;

      return hasAllowance;
    }

    return false;
  },

  async getMyTokensWithBalance(forceUpdate?: string) {
    const address = AccountController.state.address;
    const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId;

    if (!address) {
      return [];
    }

    const response = await BlockchainApiController.getBalance(address, chainId, forceUpdate);
    const balances = response?.balances.filter(balance => balance.quantity.decimals !== '0');

    AccountController.setTokenBalance(balances, ChainController.state.activeChain);

    return this.mapBalancesToSwapTokens(balances);
  },

  mapBalancesToSwapTokens(balances?: BlockchainApiBalanceResponse['balances']) {
    return (
      balances?.map(
        token =>
          ({
            ...token,
            address: token?.address || ChainController.getActiveNetworkTokenAddress(),
            decimals: parseInt(token.quantity.decimals, 10),
            logoUri: token.iconUrl,
            eip2612: false
          }) as SwapTokenWithBalance
      ) || []
    );
  },

  async fetchGasPrice() {
    const projectId = OptionsController.state.projectId;
    const caipNetwork = ChainController.state.activeCaipNetwork;

    if (!caipNetwork) {
      return null;
    }

    return await BlockchainApiController.fetchGasPrice({
      projectId,
      chainId: caipNetwork.caipNetworkId
    });
  }
};
