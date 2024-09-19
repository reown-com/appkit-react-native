import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, subscribe as sub } from 'valtio';

import { ConstantsUtil } from '../utils/ConstantsUtil';
import { SwapApiUtil } from '../utils/SwapApiUtil';
import { NetworkController } from './NetworkController';
import { BlockchainApiController } from './BlockchainApiController';
import { OptionsController } from './OptionsController';
import { SwapCalculationUtil } from '../utils/SwapCalculationUtil';

// -- Constants ---------------------------------------- //
export const INITIAL_GAS_LIMIT = 150000;
export const TO_AMOUNT_DECIMALS = 6;

// -- Types --------------------------------------------- //

export interface SwapControllerState {
  // Input values
  networkPrice: string;
  networkTokenSymbol: string;

  // Tokens
  tokensPriceMap: Record<string, number>;

  // Calculations
  gasFee: string;
  gasPriceInUSD?: number;
}

type StateKey = keyof SwapControllerState;

// -- State --------------------------------------------- //
const initialState: SwapControllerState = {
  // Input values
  networkPrice: '0',
  networkTokenSymbol: '',

  // Tokens
  tokensPriceMap: {},

  // Calculations
  gasFee: '0',
  gasPriceInUSD: 0
};

const state = proxy<SwapControllerState>(initialState);

// -- Controller ---------------------------------------- //
export const SwapController = {
  state,

  subscribe(callback: (newState: SwapControllerState) => void) {
    return sub(state, () => callback(state));
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SwapControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  getParams() {
    const caipNetwork = NetworkController.state.caipNetwork;
    const networkAddress = `${caipNetwork?.id}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS}`;

    return {
      networkAddress
    };
  },

  resetState() {
    state.tokensPriceMap = initialState.tokensPriceMap;
    state.networkPrice = initialState.networkPrice;
    state.networkTokenSymbol = initialState.networkTokenSymbol;
  },

  //this
  async getNetworkTokenPrice() {
    const { networkAddress } = this.getParams();

    const response = await BlockchainApiController.fetchTokenPrice({
      projectId: OptionsController.state.projectId,
      addresses: [networkAddress]
    });
    const token = response?.fungibles?.[0];
    const price = token?.price.toString() || '0';
    state.tokensPriceMap[networkAddress] = parseFloat(price);
    state.networkTokenSymbol = token?.symbol || '';
    state.networkPrice = price;
  },

  //this
  async getInitialGasPrice() {
    const res = await SwapApiUtil.fetchGasPrice();

    if (!res) {
      return { gasPrice: null, gasPriceInUsd: null };
    }

    const value = res.standard;
    const gasFee = BigInt(value);
    const gasLimit = BigInt(INITIAL_GAS_LIMIT);
    const gasPrice = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gasLimit, gasFee);

    state.gasFee = value;
    state.gasPriceInUSD = gasPrice;

    return { gasPrice: gasFee, gasPriceInUSD: state.gasPriceInUSD };
  }
};
