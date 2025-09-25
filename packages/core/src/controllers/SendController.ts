import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref, subscribe as sub } from 'valtio';
import { ContractUtil, type Balance } from '@reown/appkit-common-react-native';

import { SnackController } from './SnackController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { EventsController } from './EventsController';
import { RouterController } from './RouterController';
import { ConnectionsController } from './ConnectionsController';
import { SwapController } from './SwapController';
import { ConstantsUtil as CoreConstantsUtil } from '../utils/ConstantsUtil';

// -- Types --------------------------------------------- //
export interface TxParams {
  receiverAddress: string;
  sendTokenAmount: number;
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

  setLoading(loading: SendControllerState['loading']) {
    state.loading = loading;
  },

  async sendToken() {
    const isAuth = !!ConnectionsController.state.connection?.properties?.provider;
    const eventProperties = {
      isSmartAccount: ConnectionsController.state.accountType === 'smartAccount',
      token: this.state.token?.address ?? this.state.token?.symbol ?? '',
      amount: this.state.sendTokenAmount || 0,
      network: ConnectionsController.state.activeNetwork?.caipNetworkId ?? ''
    };

    try {
      this.state.loading = true;

      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: eventProperties
      });

      switch (ConnectionsController.state.activeNamespace) {
        case 'eip155':
          await SendController.sendEvmToken();

          break;
        case 'solana':
          await SendController.sendSolanaToken();

          break;
        default:
          throw new Error('Unsupported chain');
      }

      SnackController.showSuccess('Transaction started');
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_SUCCESS',
        properties: eventProperties
      });
      RouterController.reset(isAuth ? 'Account' : 'AccountDefault');
      this.resetState();
    } catch (error: any) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: eventProperties
      });

      if (error?.message && error?.message.includes('user rejected')) {
        SnackController.showError('Transaction cancelled');
      } else {
        SnackController.showError('Something went wrong');
      }
    } finally {
      this.state.loading = false;
    }
  },

  async sendEvmToken() {
    if (this.state.token?.address && this.state.sendTokenAmount && this.state.receiverAddress) {
      await this.sendERC20Token({
        receiverAddress: this.state.receiverAddress,
        tokenAddress: this.state.token.address,
        sendTokenAmount: this.state.sendTokenAmount,
        decimals: this.state.token.quantity?.decimals || '0'
      });
    } else if (
      this.state.receiverAddress &&
      this.state.sendTokenAmount &&
      this.state.token?.quantity?.decimals
    ) {
      await this.sendNativeToken({
        receiverAddress: this.state.receiverAddress,
        sendTokenAmount: this.state.sendTokenAmount,
        decimals: this.state.token.quantity.decimals
      });
    }
  },

  async sendNativeToken(params: TxParams) {
    const to = params.receiverAddress as `0x${string}`;
    const network = ConnectionsController.state.activeNetwork;
    const address = CoreHelperUtil.getPlainAddress(
      ConnectionsController.state.activeAddress
    ) as `0x${string}`;
    if (!address) {
      throw new Error('Invalid address');
    }

    const value = ConnectionsController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    );
    const data = '0x';

    await ConnectionsController.sendTransaction({
      to,
      address,
      data,
      value,
      network
    });
  },

  async sendERC20Token(params: ContractWriteParams) {
    const network = ConnectionsController.state.activeNetwork;
    const amount = ConnectionsController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    );

    if (
      ConnectionsController.state.activeAddress &&
      params.sendTokenAmount &&
      params.receiverAddress &&
      params.tokenAddress
    ) {
      const tokenAddress = CoreHelperUtil.getPlainAddress(
        params.tokenAddress as `${string}:${string}:${string}`
      ) as `0x${string}`;

      const fromAddress = CoreHelperUtil.getPlainAddress(
        ConnectionsController.state.activeAddress
      ) as `0x${string}`;
      if (!fromAddress) {
        throw new Error('Invalid address');
      }

      await ConnectionsController.writeContract({
        fromAddress,
        tokenAddress,
        receiverAddress: params.receiverAddress as `0x${string}`,
        tokenAmount: amount,
        method: 'transfer',
        abi: ContractUtil.getERC20Abi(tokenAddress),
        network
      });
    }
  },

  async sendSolanaToken() {
    if (!this.state.sendTokenAmount || !this.state.receiverAddress) {
      throw new Error('An amount and receiver address are required');
    }

    const plainAddress = CoreHelperUtil.getPlainAddress(ConnectionsController.state.activeAddress);
    if (!plainAddress) {
      throw new Error('Invalid address');
    }

    let tokenMint: string | undefined;

    if (
      SendController.state.token &&
      SendController.state.token.address !== CoreConstantsUtil.NATIVE_TOKEN_ADDRESS.solana
    ) {
      if (CoreHelperUtil.isCaipAddress(SendController.state.token.address)) {
        tokenMint = CoreHelperUtil.getPlainAddress(SendController.state.token.address);
      } else {
        tokenMint = SendController.state.token.address;
      }
    }

    await ConnectionsController.sendTransaction({
      tokenMint,
      fromAddress: plainAddress,
      toAddress: this.state.receiverAddress,
      amount: this.state.sendTokenAmount,
      network: ConnectionsController.state.activeNetwork
    });
  },

  async fetchNetworkPrice() {
    await SwapController.getNetworkTokenPrice();
  },

  resetState() {
    state.token = undefined;
    state.sendTokenAmount = undefined;
    state.receiverAddress = undefined;
    state.receiverProfileImageUrl = undefined;
    state.receiverProfileName = undefined;
    state.loading = false;
  }
};
