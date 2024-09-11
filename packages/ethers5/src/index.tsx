import { useSnapshot } from 'valtio';
export {
  AppKitAccountButton,
  AppKitButton,
  AppKitConnectButton,
  AppKitNetworkButton,
  AppKit
} from '@reown/appkit-scaffold-react-native';
import {
  ConstantsUtil,
  EthersStoreUtil,
  type Provider
} from '@reown/appkit-scaffold-utils-react-native';
export { defaultConfig } from './utils/defaultConfig';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { AppKitOptions } from './client';
import { AppKit } from './client';

// -- Types -------------------------------------------------------------------
export type { AppKitOptions } from './client';

type OpenOptions = Parameters<AppKit['open']>[0];

// -- Setup -------------------------------------------------------------------
let modal: AppKit | undefined;

export function createAppKit(options: AppKitOptions) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      _sdkVersion: `react-native-ethers5-${ConstantsUtil.VERSION}`
    });
  }

  return modal;
}

// -- Hooks -------------------------------------------------------------------
export function useAppKit() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" hook');
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options);
  }

  async function close() {
    await modal?.close();
  }

  return { open, close };
}

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" hook');
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

export function useAppKitProvider() {
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

export function useAppKitAccount() {
  const { address, isConnected, chainId } = useSnapshot(EthersStoreUtil.state);

  return {
    address,
    isConnected,
    chainId
  };
}

export function useWalletInfo() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useWalletInfo" hook');
  }

  const walletInfo = useSyncExternalStore(
    modal.subscribeWalletInfo,
    modal.getWalletInfo,
    modal.getWalletInfo
  );

  return { walletInfo };
}

export function useAppKitError() {
  const { error } = useSnapshot(EthersStoreUtil.state);

  return {
    error
  };
}

export function useAppKitEvents() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" hook');
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
