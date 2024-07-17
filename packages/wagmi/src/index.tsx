import '@walletconnect/react-native-compat';
export {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton,
  Web3Modal
} from '@web3modal/scaffold-react-native';
import { ConstantsUtil } from '@web3modal/scaffold-utils-react-native';
export { defaultWagmiConfig } from './utils/defaultWagmiConfig';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Web3ModalOptions } from './client';
import { Web3Modal } from './client';

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from './client';

type OpenOptions = Parameters<Web3Modal['open']>[0];

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined;

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `react-native-wagmi-${ConstantsUtil.VERSION}`
    });
  }

  return modal;
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" hook');
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options);
  }

  async function close() {
    await modal?.close();
  }

  return { open, close };
}

export function useWeb3ModalState() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalState" hook');
  }

  const [state, setState] = useState(modal.getState());

  useEffect(() => {
    const unsubscribe = modal?.subscribeState(newState => {
      if (newState) setState({ ...newState });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return state;
}

export function useWalletInfo() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWalletInfo" hook');
  }

  const walletInfo = useSyncExternalStore(
    modal.subscribeWalletInfo,
    modal.getWalletInfo,
    modal.getWalletInfo
  );

  return { walletInfo };
}

export function useWeb3ModalEvents() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalEvents" hook');
  }

  const [event, setEvents] = useState(modal.getEvent());

  useEffect(() => {
    const unsubscribe = modal?.subscribeEvents(newEvent => {
      setEvents({ ...newEvent });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return event;
}
