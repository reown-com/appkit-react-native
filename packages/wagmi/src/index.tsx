import '@walletconnect/react-native-compat';
import { useEffect, useState, useSyncExternalStore } from 'react';
export {
  AccountButton,
  AppKitButton,
  ConnectButton,
  NetworkButton,
  AppKit
} from '@reown/appkit-scaffold-react-native';
import type { EventName, EventsControllerState } from '@reown/appkit-scaffold-react-native';
import { ConstantsUtil } from '@reown/appkit-common-react-native';

export { defaultWagmiConfig } from './utils/defaultWagmiConfig';
import type { AppKitOptions } from './client';
import { AppKit } from './client';
import { WagmiAdapter } from './adapter';
// -- Types -------------------------------------------------------------------
export type { AppKitOptions } from './client';

type OpenOptions = Parameters<AppKit['open']>[0];

// -- Setup -------------------------------------------------------------------
let modal: AppKit | undefined;

export { WagmiAdapter };

export function createAppKit(options: AppKitOptions) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      _sdkVersion: `react-native-wagmi-${ConstantsUtil.VERSION}`
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

export function useAppKitEvents(callback?: (newEvent: EventsControllerState) => void) {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" hook');
  }

  const [event, setEvents] = useState(modal.getEvent());

  useEffect(() => {
    const unsubscribe = modal?.subscribeEvents(newEvent => {
      setEvents({ ...newEvent });
      callback?.(newEvent);
    });

    return () => {
      unsubscribe?.();
    };
  }, [callback]);

  return event;
}

export function useAppKitEventSubscription(
  event: EventName,
  callback: (newEvent: EventsControllerState) => void
) {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEventSubscription" hook');
  }

  useEffect(() => {
    const unsubscribe = modal?.subscribeEvent(event, callback);

    return () => {
      unsubscribe?.();
    };
  }, [callback, event]);
}
