import { useSnapshot } from 'valtio';
export {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton,
  Web3Modal
} from '@reown/scaffold-react-native';
import { ConstantsUtil, EthersStoreUtil, type Provider } from '@reown/scaffold-utils-react-native';
export { defaultConfig } from './utils/defaultConfig';
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
      _sdkVersion: `react-native-ethers5-${ConstantsUtil.VERSION}`
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

export function useWeb3ModalProvider() {
  const { provider, providerType } = useSnapshot(EthersStoreUtil.state);

  const walletProvider = provider as Provider | undefined;
  const walletProviderType = providerType;

  return {
    walletProvider,
    walletProviderType
  };
}

export function useDisconnect() {
  async function disconnect() {
    await modal?.disconnect();
  }

  return {
    disconnect
  };
}

export function useWeb3ModalAccount() {
  const { address, isConnected, chainId } = useSnapshot(EthersStoreUtil.state);

  return {
    address,
    isConnected,
    chainId
  };
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

export function useWeb3ModalError() {
  const { error } = useSnapshot(EthersStoreUtil.state);

  return {
    error
  };
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
