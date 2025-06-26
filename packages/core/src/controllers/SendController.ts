import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref, subscribe as sub } from 'valtio';
import { ContractUtil, type Balance } from '@reown/appkit-common-react-native';
import { AccountController } from './AccountController';
import { ConnectionController } from './ConnectionController';
import { SnackController } from './SnackController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { EventsController } from './EventsController';
import { NetworkController } from './NetworkController';
import { RouterController } from './RouterController';

// -- Types --------------------------------------------- //
export interface TxParams {
  receiverAddress: string;
  sendTokenAmount: number;
  gasPrice: bigint;
  decimals: string;
}

export interface ContractWriteParams {
  receiverAddress: string;
  tokenAddress: string;
  sendTokenAmount: number;
  decimals: string;
}

export interface SendControllerState {
  token?: Balance;
  sendTokenAmount?: number;
  receiverAddress?: string;
  receiverProfileName?: string;
  receiverProfileImageUrl?: string;
  gasPrice?: bigint;
  gasPriceInUSD?: number;
  loading: boolean;
}

type StateKey = keyof SendControllerState;

// -- State --------------------------------------------- //
const state = proxy<SendControllerState>({
  loading: false
});

// -- Controller ---------------------------------------- //
export const SendController = {
  state,

  subscribe(callback: (newState: SendControllerState) => void) {
    return sub(state, () => callback(state));
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SendControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setToken(token: SendControllerState['token']) {
    if (token) {
      state.token = ref(token);
    }
  },

  setTokenAmount(sendTokenAmount: SendControllerState['sendTokenAmount']) {
    state.sendTokenAmount = sendTokenAmount;
  },

  setReceiverAddress(receiverAddress: SendControllerState['receiverAddress']) {
    state.receiverAddress = receiverAddress;
  },

  setReceiverProfileImageUrl(
    receiverProfileImageUrl: SendControllerState['receiverProfileImageUrl']
  ) {
    state.receiverProfileImageUrl = receiverProfileImageUrl;
  },

  setReceiverProfileName(receiverProfileName: SendControllerState['receiverProfileName']) {
    state.receiverProfileName = receiverProfileName;
  },

  setGasPrice(gasPrice: SendControllerState['gasPrice']) {
    state.gasPrice = gasPrice;
  },

  setGasPriceInUsd(gasPriceInUSD: SendControllerState['gasPriceInUSD']) {
    state.gasPriceInUSD = gasPriceInUSD;
  },

  setLoading(loading: SendControllerState['loading']) {
    state.loading = loading;
  },

  sendToken() {
    if (this.state.token?.address && this.state.sendTokenAmount && this.state.receiverAddress) {
      state.loading = true;
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount',
          token: this.state.token.address,
          amount: this.state.sendTokenAmount,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      this.sendERC20Token({
        receiverAddress: this.state.receiverAddress,
        tokenAddress: this.state.token.address,
        sendTokenAmount: this.state.sendTokenAmount,
        decimals: this.state.token.quantity.decimals
      });
    } else if (
      this.state.receiverAddress &&
      this.state.sendTokenAmount &&
      this.state.gasPrice &&
      this.state.token?.quantity.decimals
    ) {
      state.loading = true;
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount',
          token: this.state.token?.symbol,
          amount: this.state.sendTokenAmount,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      this.sendNativeToken({
        receiverAddress: this.state.receiverAddress,
        sendTokenAmount: this.state.sendTokenAmount,
        gasPrice: this.state.gasPrice,
        decimals: this.state.token.quantity.decimals
      });
    }
  },

  async sendNativeToken(params: TxParams) {
    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false
    });

    const to = params.receiverAddress as `0x${string}`;
    const address = AccountController.state.address as `0x${string}`;
    const value = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    );
    const data = '0x';

    try {
      await ConnectionController.sendTransaction({
        to,
        address,
        data,
        value,
        gasPrice: params.gasPrice
      });
      SnackController.showSuccess('Transaction started');
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_SUCCESS',
        properties: {
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount',
          token: this.state.token?.symbol || '',
          amount: params.sendTokenAmount,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      this.resetSend();
    } catch (error) {
      state.loading = false;
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: {
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount',
          token: this.state.token?.symbol || '',
          amount: params.sendTokenAmount,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      SnackController.showError('Something went wrong');
    }
  },

  async sendERC20Token(params: ContractWriteParams) {
    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false
    });

    const amount = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    );

    try {
      if (
        AccountController.state.address &&
        params.sendTokenAmount &&
        params.receiverAddress &&
        params.tokenAddress
      ) {
        const tokenAddress = CoreHelperUtil.getPlainAddress(
          params.tokenAddress as `${string}:${string}:${string}`
        ) as `0x${string}`;
        await ConnectionController.writeContract({
          fromAddress: AccountController.state.address as `0x${string}`,
          tokenAddress,
          receiverAddress: params.receiverAddress as `0x${string}`,
          tokenAmount: amount,
          method: 'transfer',
          abi: ContractUtil.getERC20Abi(tokenAddress)
        });
        SnackController.showSuccess('Transaction started');
        this.resetSend();
      }
    } catch (error) {
      state.loading = false;
      SnackController.showError('Something went wrong');
    }
  },

  resetSend() {
    state.token = undefined;
    state.sendTokenAmount = undefined;
    state.receiverAddress = undefined;
    state.receiverProfileImageUrl = undefined;
    state.receiverProfileName = undefined;
    state.loading = false;
  }
};
