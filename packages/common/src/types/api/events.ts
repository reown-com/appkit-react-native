import type { Platform, SocialProvider, AccountType } from '../common';

export type EventName =
  | 'MODAL_LOADED'
  | 'MODAL_OPEN'
  | 'MODAL_CLOSE'
  | 'CLICK_ALL_WALLETS'
  | 'CLICK_NETWORKS'
  | 'SWITCH_NETWORK'
  | 'SELECT_WALLET'
  | 'CONNECT_SUCCESS'
  | 'CONNECT_ERROR'
  | 'DISCONNECT_SUCCESS'
  | 'DISCONNECT_ERROR'
  | 'CLICK_WALLET_HELP'
  | 'CLICK_NETWORK_HELP'
  | 'CLICK_GET_WALLET'
  | 'EMAIL_LOGIN_SELECTED'
  | 'EMAIL_VERIFICATION_CODE_PASS'
  | 'EMAIL_VERIFICATION_CODE_FAIL'
  | 'EMAIL_EDIT'
  | 'EMAIL_EDIT_COMPLETE'
  | 'EMAIL_UPGRADE_FROM_MODAL'
  | 'SIWX_AUTH_SUCCESS'
  | 'SIWX_AUTH_ERROR'
  | 'CLICK_CANCEL_SIWX'
  | 'CLICK_TRANSACTIONS'
  | 'ERROR_FETCH_TRANSACTIONS'
  | 'LOAD_MORE_TRANSACTIONS'
  | 'OPEN_SEND'
  | 'OPEN_SWAP'
  | 'INITIATE_SWAP'
  | 'SWAP_SUCCESS'
  | 'SWAP_ERROR'
  | 'SEND_INITIATED'
  | 'SEND_SUCCESS'
  | 'SEND_ERROR'
  | 'SOCIAL_LOGIN_STARTED'
  | 'SOCIAL_LOGIN_SUCCESS'
  | 'SOCIAL_LOGIN_REQUEST_USER_DATA'
  | 'SOCIAL_LOGIN_CANCELED'
  | 'SOCIAL_LOGIN_ERROR'
  | 'SET_PREFERRED_ACCOUNT_TYPE';

export type Event =
  | {
      type: 'track';
      event: 'MODAL_CREATED';
    }
  | {
      type: 'track';
      event: 'MODAL_LOADED';
    }
  | {
      type: 'track';
      event: 'MODAL_OPEN';
      properties: {
        connected: boolean;
      };
    }
  | {
      type: 'track';
      event: 'MODAL_CLOSE';
      properties: {
        connected: boolean;
      };
    }
  | {
      type: 'track';
      event: 'CLICK_ALL_WALLETS';
    }
  | {
      type: 'track';
      event: 'CLICK_NETWORKS';
    }
  | {
      type: 'track';
      event: 'SWITCH_NETWORK';
      properties: {
        network: number | string;
      };
    }
  | {
      type: 'track';
      event: 'SELECT_WALLET';
      properties: {
        name: string;
        platform?: Platform;
        explorer_id?: string;
      };
    }
  | {
      type: 'track';
      event: 'CONNECT_SUCCESS';
      properties: {
        name: string;
        method: Platform;
        explorer_id?: string;
      };
    }
  | {
      type: 'track';
      event: 'CONNECT_ERROR';
      properties: {
        message: string;
      };
    }
  | {
      type: 'track';
      event: 'DISCONNECT_SUCCESS';
    }
  | {
      type: 'track';
      event: 'DISCONNECT_ERROR';
    }
  | {
      type: 'track';
      event: 'CLICK_WALLET_HELP';
    }
  | {
      type: 'track';
      event: 'CLICK_NETWORK_HELP';
    }
  | {
      type: 'track';
      event: 'CLICK_GET_WALLET';
    }
  | {
      type: 'track';
      event: 'EMAIL_LOGIN_SELECTED';
    }
  | {
      type: 'track';
      event: 'EMAIL_VERIFICATION_CODE_PASS';
    }
  | {
      type: 'track';
      event: 'EMAIL_VERIFICATION_CODE_FAIL';
    }
  | {
      type: 'track';
      event: 'EMAIL_EDIT';
    }
  | {
      type: 'track';
      event: 'EMAIL_EDIT_COMPLETE';
    }
  | {
      type: 'track';
      event: 'EMAIL_UPGRADE_FROM_MODAL';
    }
  | {
      type: 'track';
      event: 'CLICK_SIGN_SIWE_MESSAGE';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      address?: string;
      event: 'CLICK_SIGN_SIWX_MESSAGE';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'CLICK_CANCEL_SIWX';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'SIWX_AUTH_SUCCESS';
      properties: {
        network: string;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'SIWX_AUTH_ERROR';
      properties: {
        network: string;
        isSmartAccount: boolean;
        message?: string;
      };
    }
  | {
      type: 'track';
      event: 'CLICK_TRANSACTIONS';
      properties: {
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'ERROR_FETCH_TRANSACTIONS';
      properties: {
        address: string;
        projectId: string;
        cursor: string | undefined;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'LOAD_MORE_TRANSACTIONS';
      properties: {
        address: string | undefined;
        projectId: string;
        cursor: string | undefined;
        isSmartAccount: boolean;
      };
    }
  | {
      type: 'track';
      event: 'OPEN_SEND';
      properties: {
        isSmartAccount: boolean;
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'OPEN_SWAP';
      properties: {
        isSmartAccount: boolean;
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'INITIATE_SWAP';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
      };
    }
  | {
      type: 'track';
      event: 'SWAP_SUCCESS';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
      };
    }
  | {
      type: 'track';
      event: 'SWAP_ERROR';
      properties: {
        isSmartAccount: boolean;
        network: string;
        swapFromToken: string;
        swapToToken: string;
        swapFromAmount: string;
        swapToAmount: string;
        message: string;
      };
    }
  | {
      type: 'track';
      event: 'SEND_INITIATED';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    }
  | {
      type: 'track';
      event: 'SEND_SUCCESS';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    }
  | {
      type: 'track';
      event: 'SEND_ERROR';
      properties: {
        isSmartAccount: boolean;
        network: string;
        token: string;
        amount: number;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_STARTED';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_SUCCESS';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_REQUEST_USER_DATA';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_CANCELED';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SOCIAL_LOGIN_ERROR';
      properties: {
        provider: SocialProvider;
      };
    }
  | {
      type: 'track';
      event: 'SET_PREFERRED_ACCOUNT_TYPE';
      properties: {
        accountType: AccountType;
        network: string;
      };
    }
  | {
      type: 'track';
      event: 'SELECT_BUY_CRYPTO';
    }
  | {
      type: 'track';
      event: 'SELECT_BUY_ASSET';
      properties: {
        asset: string;
      };
    }
  | {
      type: 'track';
      event: 'BUY_SUBMITTED';
      properties: {
        asset?: string;
        network?: string;
        amount?: string;
        currency?: string;
        provider?: string;
        serviceProvider?: string;
        paymentMethod?: string;
      };
    }
  | {
      type: 'track';
      event: 'BUY_SUCCESS';
      properties: {
        asset?: string | null;
        network?: string | null;
        amount?: string | null;
        currency?: string | null;
        provider?: string | null;
        orderId?: string | null;
      };
    }
  | {
      type: 'track';
      event: 'BUY_FAIL';
      properties: {
        asset?: string;
        network?: string;
        amount?: string;
        currency?: string;
        provider?: string;
        serviceProvider?: string;
        paymentMethod?: string;
        message?: string;
      };
    }
  | {
      type: 'track';
      event: 'BUY_CANCEL';
      properties?: {
        message?: string;
      };
    };
