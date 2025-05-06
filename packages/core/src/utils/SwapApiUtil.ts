import { BlockchainApiController } from '../controllers/BlockchainApiController';
import { OptionsController } from '../controllers/OptionsController';
import { NetworkController } from '../controllers/NetworkController';
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiSwapAllowanceRequest,
  SwapTokenWithBalance
} from './TypeUtil';
import { AccountController } from '../controllers/AccountController';
import { ConnectionController } from '../controllers/ConnectionController';
import { ConnectionsController } from '../controllers/ConnectionsController';

export const SwapApiUtil = {
  async getTokenList() {
    const chainId = ConnectionsController.state.activeNetwork?.caipNetworkId ?? 'eip155:1';
    const response = await BlockchainApiController.fetchSwapTokens({
      projectId: OptionsController.state.projectId,
      chainId
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
    const { activeAddress, activeNetwork: network } = ConnectionsController.state;
    const address = activeAddress?.split(':')[2];

    if (!address) {
      return [];
    }

    const response = await BlockchainApiController.getBalance(
      address,
      network?.caipNetworkId,
      forceUpdate
    );
    const balances = response?.balances.filter(balance => balance.quantity.decimals !== '0');

    AccountController.setTokenBalance(balances);

    return this.mapBalancesToSwapTokens(balances);
  },

  mapBalancesToSwapTokens(balances?: BlockchainApiBalanceResponse['balances']) {
    return (
      balances?.map(
        token =>
          ({
            ...token,
            address: token?.address || NetworkController.getActiveNetworkTokenAddress(),
            decimals: parseInt(token.quantity.decimals, 10),
            logoUri: token.iconUrl,
            eip2612: false
          }) as SwapTokenWithBalance
      ) || []
    );
  },

  async fetchGasPrice() {
    const projectId = OptionsController.state.projectId;
    const caipNetwork = NetworkController.state.caipNetwork;

    if (!caipNetwork) {
      return null;
    }

    return await BlockchainApiController.fetchGasPrice({
      projectId,
      chainId: caipNetwork.id
    });
  }
};
