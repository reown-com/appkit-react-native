import { BlockchainApiController } from '../controllers/BlockchainApiController';
import { OptionsController } from '../controllers/OptionsController';
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiSwapAllowanceRequest,
  SwapTokenWithBalance
} from './TypeUtil';
import { ConnectionsController } from '../controllers/ConnectionsController';
import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common-react-native';
import { ConstantsUtil } from './ConstantsUtil';

export const SwapApiUtil = {
  async getTokenList() {
    const chainId: CaipNetworkId =
      ConnectionsController.state.activeNetwork?.caipNetworkId ?? 'eip155:1';
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
        ConnectionsController.parseUnits(sourceTokenAmount, sourceTokenDecimals) || 0;
      const hasAllowance = BigInt(response.allowance) >= parsedValue;

      return hasAllowance;
    }

    return false;
  },

  async getMyTokensWithBalance(forceUpdate?: CaipAddress[]) {
    const { activeAddress } = ConnectionsController.state;

    const response = await BlockchainApiController.getBalance(activeAddress, forceUpdate);
    const balances = response?.balances.filter(balance => balance.quantity.decimals !== '0');

    // TODO: update balances
    // ConnectionsController.updateBalances(balances);

    return this.mapBalancesToSwapTokens(balances);
  },

  mapBalancesToSwapTokens(balances?: BlockchainApiBalanceResponse['balances']) {
    const { activeNamespace, activeCaipNetworkId } = ConnectionsController.state;
    const address = activeNamespace
      ? ConstantsUtil.NATIVE_TOKEN_ADDRESS[activeNamespace]
      : undefined;

    return (
      balances?.map(
        token =>
          ({
            ...token,
            address: token?.address ?? `${token?.chainId ?? activeCaipNetworkId}:${address}`,
            decimals: parseInt(token.quantity.decimals, 10),
            logoUri: token.iconUrl,
            eip2612: false
          }) as SwapTokenWithBalance
      ) || []
    );
  },

  async fetchGasPrice() {
    const projectId = OptionsController.state.projectId;
    const caipNetwork = ConnectionsController.state.activeNetwork;

    if (!caipNetwork) {
      return null;
    }

    return await BlockchainApiController.fetchGasPrice({
      projectId,
      chainId: caipNetwork.caipNetworkId
    });
  }
};
