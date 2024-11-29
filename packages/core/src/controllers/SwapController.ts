import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, subscribe as sub } from 'valtio';
import { NumberUtil } from '@reown/appkit-common-react-native';

import { ConstantsUtil } from '../utils/ConstantsUtil';
import { SwapApiUtil } from '../utils/SwapApiUtil';
import { NetworkController } from './NetworkController';
import { BlockchainApiController } from './BlockchainApiController';
import { OptionsController } from './OptionsController';
import { SwapCalculationUtil } from '../utils/SwapCalculationUtil';
import { SnackController } from './SnackController';
import { RouterController } from './RouterController';
import type { SwapInputTarget, SwapTokenWithBalance } from '../utils/TypeUtil';
import { ConnectorController } from './ConnectorController';
import { AccountController } from './AccountController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { ConnectionController } from './ConnectionController';
import { TransactionsController } from './TransactionsController';
import { EventsController } from './EventsController';

// -- Constants ---------------------------------------- //
export const INITIAL_GAS_LIMIT = 150000;
export const TO_AMOUNT_DECIMALS = 6;

// -- Types --------------------------------------------- //
type TransactionParams = {
  data: string;
  to: string;
  gas: bigint;
  gasPrice: bigint;
  value: bigint;
  toAmount: string;
};

class TransactionError extends Error {
  shortMessage?: string;

  constructor(message?: string, shortMessage?: string) {
    super(message);
    this.name = 'TransactionError';
    this.shortMessage = shortMessage;
  }
}

export interface SwapControllerState {
  // Loading states
  initializing: boolean;
  initialized: boolean;
  loadingPrices: boolean;
  loadingQuote?: boolean;
  loadingApprovalTransaction?: boolean;
  loadingBuildTransaction?: boolean;
  loadingTransaction?: boolean;

  // Error states
  fetchError: boolean;

  // Approval & Swap transaction states
  approvalTransaction: TransactionParams | undefined;
  swapTransaction: TransactionParams | undefined;
  transactionError?: string;

  // Input values
  sourceToken?: SwapTokenWithBalance;
  sourceTokenAmount: string;
  sourceTokenPriceInUSD: number;
  toToken?: SwapTokenWithBalance;
  toTokenAmount: string;
  toTokenPriceInUSD: number;
  networkPrice: string;
  networkBalanceInUSD: string;
  networkTokenSymbol: string;
  inputError: string | undefined;

  // Request values
  slippage: number;

  // Tokens
  tokens?: SwapTokenWithBalance[];
  suggestedTokens?: SwapTokenWithBalance[];
  popularTokens?: SwapTokenWithBalance[];
  foundTokens?: SwapTokenWithBalance[];
  myTokensWithBalance?: SwapTokenWithBalance[];
  tokensPriceMap: Record<string, number>;

  // Calculations
  gasFee: string;
  gasPriceInUSD?: number;
  priceImpact: number | undefined;
  maxSlippage: number | undefined;
  providerFee: string | undefined;
}

type StateKey = keyof SwapControllerState;

// -- State --------------------------------------------- //
const initialState: SwapControllerState = {
  // Loading states
  initializing: false,
  initialized: false,
  loadingPrices: false,
  loadingQuote: false,
  loadingApprovalTransaction: false,
  loadingBuildTransaction: false,
  loadingTransaction: false,

  // Error states
  fetchError: false,

  // Approval & Swap transaction states
  approvalTransaction: undefined,
  swapTransaction: undefined,
  transactionError: undefined,

  // Input values
  sourceToken: undefined,
  sourceTokenAmount: '',
  sourceTokenPriceInUSD: 0,
  toToken: undefined,
  toTokenAmount: '',
  toTokenPriceInUSD: 0,
  networkPrice: '0',
  networkBalanceInUSD: '0',
  networkTokenSymbol: '',
  inputError: undefined,

  // Request values
  slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,

  // Tokens
  tokens: undefined,
  popularTokens: undefined,
  suggestedTokens: undefined,
  foundTokens: undefined,
  myTokensWithBalance: undefined,
  tokensPriceMap: {},

  // Calculations
  gasFee: '0',
  gasPriceInUSD: 0,
  priceImpact: undefined,
  maxSlippage: undefined,
  providerFee: undefined
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
    const caipAddress = AccountController.state.caipAddress;
    const address = CoreHelperUtil.getPlainAddress(caipAddress);
    const networkAddress = NetworkController.getActiveNetworkTokenAddress();
    const type = ConnectorController.state.connectedConnector;

    if (!address) {
      throw new Error('No address found to swap the tokens from.');
    }

    const invalidToToken = !state.toToken?.address || !state.toToken?.decimals;
    const invalidSourceToken =
      !state.sourceToken?.address ||
      !state.sourceToken?.decimals ||
      !NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0);
    const invalidSourceTokenAmount = !state.sourceTokenAmount;

    return {
      networkAddress,
      fromAddress: address,
      fromCaipAddress: caipAddress,
      sourceTokenAddress: state.sourceToken?.address,
      toTokenAddress: state.toToken?.address,
      toTokenAmount: state.toTokenAmount,
      toTokenDecimals: state.toToken?.decimals,
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenDecimals: state.sourceToken?.decimals,
      invalidToToken,
      invalidSourceToken,
      invalidSourceTokenAmount,
      availableToSwap:
        caipAddress && !invalidToToken && !invalidSourceToken && !invalidSourceTokenAmount,
      isAuthConnector: type === 'AUTH'
    };
  },

  switchTokens() {
    if (state.initializing || !state.initialized) {
      return;
    }

    let newSourceToken = state.toToken ? { ...state.toToken } : undefined;
    const sourceTokenWithBalance = state.myTokensWithBalance?.find(
      token => token.address === newSourceToken?.address
    );

    if (sourceTokenWithBalance) {
      newSourceToken = sourceTokenWithBalance;
    }

    const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined;
    const newSourceTokenAmount =
      newSourceToken && state.toTokenAmount === '' ? '1' : state.toTokenAmount;

    this.setSourceToken(newSourceToken);
    this.setToToken(newToToken);

    this.setSourceTokenAmount(newSourceTokenAmount);
    this.setToTokenAmount('');
    this.swapTokens();
  },

  resetState() {
    state.myTokensWithBalance = initialState.myTokensWithBalance;
    state.tokensPriceMap = initialState.tokensPriceMap;
    state.initialized = initialState.initialized;
    state.sourceToken = initialState.sourceToken;
    state.sourceTokenAmount = initialState.sourceTokenAmount;
    state.sourceTokenPriceInUSD = initialState.sourceTokenPriceInUSD;
    state.toToken = initialState.toToken;
    state.toTokenAmount = initialState.toTokenAmount;
    state.toTokenPriceInUSD = initialState.toTokenPriceInUSD;
    state.networkPrice = initialState.networkPrice;
    state.networkTokenSymbol = initialState.networkTokenSymbol;
    state.networkBalanceInUSD = initialState.networkBalanceInUSD;
    state.inputError = initialState.inputError;
  },

  async fetchTokens() {
    const { networkAddress } = this.getParams();

    await this.getTokenList();
    await this.getNetworkTokenPrice();
    await this.getMyTokensWithBalance();

    const networkToken = state.tokens?.find(token => token.address === networkAddress);

    if (networkToken) {
      state.networkTokenSymbol = networkToken.symbol;
      const sourceToken = state.myTokensWithBalance?.find(token =>
        token.address.startsWith(networkAddress)
      );
      this.setSourceToken(sourceToken);
      this.setSourceTokenAmount('1');
    }
  },

  async getTokenList() {
    const tokens = await SwapApiUtil.getTokenList();

    state.tokens = tokens;
    state.popularTokens = tokens.sort((aTokenInfo, bTokenInfo) => {
      if (aTokenInfo.symbol < bTokenInfo.symbol) {
        return -1;
      }
      if (aTokenInfo.symbol > bTokenInfo.symbol) {
        return 1;
      }

      return 0;
    });
    state.suggestedTokens = tokens.filter(token => {
      if (ConstantsUtil.SWAP_SUGGESTED_TOKENS.includes(token.symbol)) {
        return true;
      }

      return false;
    }, {});
  },

  async getMyTokensWithBalance(forceUpdate?: string) {
    const balances = await SwapApiUtil.getMyTokensWithBalance(forceUpdate);

    if (!balances) {
      return;
    }

    await this.getInitialGasPrice();
    this.setBalances(balances);
  },

  getFilteredPopularTokens() {
    return state.popularTokens?.filter(
      token => !state.myTokensWithBalance?.some(t => t.address === token.address)
    );
  },

  setSourceToken(sourceToken: SwapTokenWithBalance | undefined) {
    if (!sourceToken) {
      state.sourceToken = sourceToken;
      state.sourceTokenAmount = '';
      state.sourceTokenPriceInUSD = 0;

      return;
    }

    state.sourceToken = sourceToken;
    this.setTokenPrice(sourceToken.address, 'sourceToken');
  },

  setSourceTokenAmount(amount: string) {
    state.sourceTokenAmount = amount;

    if (amount === '') {
      state.toTokenAmount = '';
    }
  },

  async initializeState() {
    if (state.initializing) {
      return;
    }

    state.initializing = true;
    if (!state.initialized) {
      try {
        await this.fetchTokens();
        state.initialized = true;
      } catch (error) {
        state.initialized = false;
        SnackController.showError('Failed to initialize swap');
        RouterController.goBack();
      }
    }
    state.initializing = false;
  },

  async getAddressPrice(address: string) {
    const existPrice = state.tokensPriceMap[address];

    if (existPrice) {
      return existPrice;
    }

    const response = await BlockchainApiController.fetchTokenPrice({
      projectId: OptionsController.state.projectId,
      addresses: [address]
    });
    const fungibles = response?.fungibles || [];
    const allTokens = [...(state.tokens || []), ...(state.myTokensWithBalance || [])];
    const symbol = allTokens?.find(token => token.address === address)?.symbol;
    const price = fungibles.find(p => p.symbol.toLowerCase() === symbol?.toLowerCase())?.price || 0;
    const priceAsFloat = parseFloat(price.toString());

    state.tokensPriceMap[address] = priceAsFloat;

    return priceAsFloat;
  },

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
  },

  getProviderFeePrice() {
    return SwapCalculationUtil.getProviderFeePrice(
      state.sourceTokenAmount,
      state.sourceTokenPriceInUSD
    );
  },

  setBalances(balances: SwapTokenWithBalance[]) {
    const { networkAddress } = this.getParams();
    const caipNetwork = NetworkController.state.caipNetwork;

    if (!caipNetwork) {
      return;
    }

    const networkToken = balances.find(token => token.address === networkAddress);

    balances.forEach(token => {
      state.tokensPriceMap[token.address] = token.price || 0;
    });

    state.myTokensWithBalance = balances.filter(token => token.address?.startsWith(caipNetwork.id));

    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
      : '0';
  },

  setToToken(toToken: SwapTokenWithBalance | undefined) {
    if (!toToken) {
      state.toToken = toToken;
      state.toTokenAmount = '';
      state.toTokenPriceInUSD = 0;

      return;
    }

    state.toToken = toToken;
    this.setTokenPrice(toToken.address, 'toToken');
  },

  setToTokenAmount(amount: string) {
    state.toTokenAmount = amount
      ? NumberUtil.formatNumberToLocalString(amount, TO_AMOUNT_DECIMALS)
      : '';
  },

  async setTokenPrice(address: string, target: SwapInputTarget) {
    let price = state.tokensPriceMap[address] || 0;

    if (!price) {
      state.loadingPrices = true;
      price = await this.getAddressPrice(address);
      state.loadingPrices = false;
    }

    if (target === 'sourceToken') {
      state.sourceTokenPriceInUSD = price;
    } else if (target === 'toToken') {
      state.toTokenPriceInUSD = price;
    }

    if (this.getParams().availableToSwap) {
      this.swapTokens();
    }
  },

  // -- Swap ---------------------------------------------- //
  async swapTokens() {
    const address = AccountController.state.address as `${string}:${string}:${string}`;
    const sourceToken = state.sourceToken;
    const toToken = state.toToken;
    const haveSourceTokenAmount = NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0);

    if (!toToken || !sourceToken || state.loadingPrices || !haveSourceTokenAmount) {
      return;
    }

    state.loadingQuote = true;

    const amountDecimal = NumberUtil.bigNumber(state.sourceTokenAmount)
      .multipliedBy(10 ** sourceToken.decimals)
      .integerValue();

    const quoteResponse = await BlockchainApiController.fetchSwapQuote({
      userAddress: address,
      projectId: OptionsController.state.projectId,
      from: sourceToken.address,
      to: toToken.address,
      gasPrice: state.gasFee,
      amount: amountDecimal.toString()
    });

    state.loadingQuote = false;

    const quoteToAmount = quoteResponse?.quotes?.[0]?.toAmount;

    if (!quoteToAmount) {
      return;
    }

    const toTokenAmount = NumberUtil.bigNumber(quoteToAmount)
      .dividedBy(10 ** toToken.decimals)
      .toString();

    this.setToTokenAmount(toTokenAmount);

    const isInsufficientToken = this.hasInsufficientToken(
      state.sourceTokenAmount,
      sourceToken.address
    );

    if (isInsufficientToken) {
      state.inputError = 'Insufficient balance';
    } else {
      state.inputError = undefined;
      this.setTransactionDetails();
    }
  },

  // -- Create Transactions -------------------------------------- //
  async getTransaction() {
    const { fromCaipAddress, availableToSwap } = this.getParams();
    const sourceToken = state.sourceToken;
    const toToken = state.toToken;

    if (!fromCaipAddress || !availableToSwap || !sourceToken || !toToken || state.loadingQuote) {
      return undefined;
    }

    try {
      state.loadingBuildTransaction = true;
      const hasAllowance = await SwapApiUtil.fetchSwapAllowance({
        userAddress: fromCaipAddress,
        tokenAddress: sourceToken.address,
        sourceTokenAmount: state.sourceTokenAmount,
        sourceTokenDecimals: sourceToken.decimals
      });

      let transaction: TransactionParams | undefined;

      if (hasAllowance) {
        transaction = await this.createSwapTransaction();
      } else {
        transaction = await this.createAllowanceTransaction();
      }

      state.loadingBuildTransaction = false;
      state.fetchError = false;

      return transaction;
    } catch (error) {
      RouterController.goBack();
      SnackController.showError('Failed to check allowance');
      state.loadingBuildTransaction = false;
      state.approvalTransaction = undefined;
      state.swapTransaction = undefined;
      state.fetchError = true;

      return undefined;
    }
  },

  async createAllowanceTransaction() {
    const { fromCaipAddress, fromAddress, sourceTokenAddress, toTokenAddress } = this.getParams();

    if (!fromCaipAddress || !toTokenAddress) {
      return undefined;
    }

    if (!sourceTokenAddress) {
      throw new Error('createAllowanceTransaction - No source token address found.');
    }

    try {
      const response = await BlockchainApiController.generateApproveCalldata({
        projectId: OptionsController.state.projectId,
        from: sourceTokenAddress,
        to: toTokenAddress,
        userAddress: fromCaipAddress
      });

      if (!response) {
        throw new Error('createAllowanceTransaction - No response from generateApproveCalldata');
      }
      const gasLimit = await ConnectionController.estimateGas({
        address: fromAddress as `0x${string}`,
        to: CoreHelperUtil.getPlainAddress(response.tx.to) as `0x${string}`,
        data: response.tx.data
      });

      const transaction = {
        data: response.tx.data,
        to: CoreHelperUtil.getPlainAddress(response.tx.from) as `0x${string}`,
        gas: gasLimit,
        gasPrice: BigInt(response.tx.eip155.gasPrice),
        value: BigInt(response.tx.value),
        toAmount: state.toTokenAmount
      };

      state.swapTransaction = undefined;
      state.approvalTransaction = {
        data: transaction.data,
        to: transaction.to,
        gas: transaction.gas ?? BigInt(0),
        gasPrice: transaction.gasPrice,
        value: transaction.value,
        toAmount: transaction.toAmount
      };

      return {
        data: transaction.data,
        to: transaction.to,
        gas: transaction.gas ?? BigInt(0),
        gasPrice: transaction.gasPrice,
        value: transaction.value,
        toAmount: transaction.toAmount
      };
    } catch (error) {
      RouterController.goBack();
      SnackController.showError('Failed to create approval transaction');
      state.approvalTransaction = undefined;
      state.swapTransaction = undefined;
      state.fetchError = true;

      return undefined;
    }
  },

  async createSwapTransaction() {
    const { networkAddress, fromCaipAddress, sourceTokenAmount } = this.getParams();
    const sourceToken = state.sourceToken;
    const toToken = state.toToken;

    if (!fromCaipAddress || !sourceTokenAmount || !sourceToken || !toToken) {
      return undefined;
    }

    const amount = ConnectionController.parseUnits(
      sourceTokenAmount,
      sourceToken.decimals
    )?.toString();

    try {
      const response = await BlockchainApiController.generateSwapCalldata({
        projectId: OptionsController.state.projectId,
        userAddress: fromCaipAddress,
        from: sourceToken.address,
        to: toToken.address,
        amount: amount as string
      });

      if (!response) {
        throw new Error('createSwapTransaction - No response from generateSwapCalldata');
      }

      const isSourceNetworkToken = sourceToken.address === networkAddress;

      const gas = BigInt(response.tx.eip155.gas);
      const gasPrice = BigInt(response.tx.eip155.gasPrice);

      const transaction = {
        data: response.tx.data,
        to: CoreHelperUtil.getPlainAddress(response.tx.to) as `0x${string}`,
        gas,
        gasPrice,
        value: isSourceNetworkToken ? BigInt(amount ?? '0') : BigInt('0'),
        toAmount: state.toTokenAmount
      };

      state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gas, gasPrice);

      state.approvalTransaction = undefined;
      state.swapTransaction = transaction;

      return transaction;
    } catch (error) {
      RouterController.goBack();
      SnackController.showError('Failed to create transaction');
      state.approvalTransaction = undefined;
      state.swapTransaction = undefined;
      state.fetchError = true;

      return undefined;
    }
  },

  async sendTransactionForApproval(data: TransactionParams) {
    const { fromAddress, isAuthConnector } = this.getParams();

    state.loadingApprovalTransaction = true;
    const approveLimitMessage = `Approve limit increase in your wallet`;

    if (isAuthConnector) {
      RouterController.pushTransactionStack({
        view: null,
        goBack: true,
        onSuccess() {
          SnackController.showLoading(approveLimitMessage);
        }
      });
    } else {
      SnackController.showLoading(approveLimitMessage);
    }

    try {
      await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
        value: BigInt(data.value),
        gasPrice: BigInt(data.gasPrice),
        chainNamespace: 'eip155'
      });

      await this.swapTokens();
      await this.getTransaction();
      state.approvalTransaction = undefined;
      state.loadingApprovalTransaction = false;
    } catch (err) {
      const error = err as TransactionError;
      state.transactionError = error?.shortMessage as unknown as string;
      state.loadingApprovalTransaction = false;
      SnackController.showError(error?.shortMessage || 'Transaction error');
    }
  },

  async sendTransactionForSwap(data: TransactionParams | undefined) {
    if (!data) {
      return undefined;
    }

    const { fromAddress, toTokenAmount, isAuthConnector } = this.getParams();

    state.loadingTransaction = true;

    const snackbarPendingMessage = `Swapping ${state.sourceToken
      ?.symbol} to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken
      ?.symbol}`;
    const snackbarSuccessMessage = `Swapped ${state.sourceToken
      ?.symbol} to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken
      ?.symbol}`;

    if (isAuthConnector) {
      RouterController.pushTransactionStack({
        view: 'Account',
        goBack: false,
        onSuccess() {
          SnackController.showLoading(snackbarPendingMessage);
          SwapController.resetState();
        }
      });
    } else {
      SnackController.showLoading('Confirm transaction in your wallet');
    }

    try {
      const forceUpdateAddresses = [state.sourceToken?.address, state.toToken?.address].join(',');
      const transactionHash = await ConnectionController.sendTransaction({
        address: fromAddress as `0x${string}`,
        to: data.to as `0x${string}`,
        data: data.data as `0x${string}`,
        gas: data.gas,
        gasPrice: BigInt(data.gasPrice),
        value: data.value,
        chainNamespace: 'eip155'
      });

      state.loadingTransaction = false;
      SnackController.showSuccess(snackbarSuccessMessage);
      EventsController.sendEvent({
        type: 'track',
        event: 'SWAP_SUCCESS',
        properties: {
          network: NetworkController.state.caipNetwork?.id || '',
          swapFromToken: this.state.sourceToken?.symbol || '',
          swapToToken: this.state.toToken?.symbol || '',
          swapFromAmount: this.state.sourceTokenAmount || '',
          swapToAmount: this.state.toTokenAmount || '',
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });
      SwapController.resetState();
      if (!isAuthConnector) {
        RouterController.replace('Account');
      }
      SwapController.getMyTokensWithBalance(forceUpdateAddresses);
      AccountController.fetchTokenBalance();
      TransactionsController.fetchTransactions(AccountController.state.address, true);

      return transactionHash;
    } catch (err) {
      const error = err as TransactionError;
      state.transactionError = error?.shortMessage;
      state.loadingTransaction = false;
      SnackController.showError(error?.shortMessage || 'Transaction error');
      EventsController.sendEvent({
        type: 'track',
        event: 'SWAP_ERROR',
        properties: {
          message: error?.shortMessage || error?.message || 'Unknown',
          network: NetworkController.state.caipNetwork?.id || '',
          swapFromToken: this.state.sourceToken?.symbol || '',
          swapToToken: this.state.toToken?.symbol || '',
          swapFromAmount: this.state.sourceTokenAmount || '',
          swapToAmount: this.state.toTokenAmount || '',
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });

      return undefined;
    }
  },

  // -- Checks -------------------------------------------- //
  hasInsufficientToken(sourceTokenAmount: string, sourceTokenAddress: string) {
    const isInsufficientSourceTokenForSwap = SwapCalculationUtil.isInsufficientSourceTokenForSwap(
      sourceTokenAmount,
      sourceTokenAddress,
      state.myTokensWithBalance
    );

    let insufficientNetworkTokenForGas = true;
    if (AccountController.state.preferredAccountType === 'smartAccount') {
      // Smart Accounts may pay gas in any ERC20 token
      insufficientNetworkTokenForGas = false;
    } else {
      insufficientNetworkTokenForGas = SwapCalculationUtil.isInsufficientNetworkTokenForGas(
        state.networkBalanceInUSD,
        state.gasPriceInUSD
      );
    }

    return insufficientNetworkTokenForGas || isInsufficientSourceTokenForSwap;
  },

  // -- Calculations -------------------------------------- //
  setTransactionDetails() {
    const { toTokenAddress, toTokenDecimals } = this.getParams();

    if (!toTokenAddress || !toTokenDecimals) {
      return;
    }

    state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(
      state.networkPrice,
      BigInt(state.gasFee),
      BigInt(INITIAL_GAS_LIMIT)
    );
    state.priceImpact = SwapCalculationUtil.getPriceImpact({
      sourceTokenAmount: state.sourceTokenAmount,
      sourceTokenPriceInUSD: state.sourceTokenPriceInUSD,
      toTokenPriceInUSD: state.toTokenPriceInUSD,
      toTokenAmount: state.toTokenAmount
    });
    state.maxSlippage = SwapCalculationUtil.getMaxSlippage(state.slippage, state.toTokenAmount);
    state.providerFee = SwapCalculationUtil.getProviderFee(state.sourceTokenAmount);
  }
};
