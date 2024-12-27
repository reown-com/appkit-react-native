import { useSnapshot } from 'valtio';
import { AppKit, type OpenOptions } from './client';
import type { AppKitOptions } from './utils/TypesUtil';

import {
  AccountController,
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  type SdkVersion,
  type UseAppKitAccountReturn,
  type UseAppKitNetworkReturn
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork, ChainNamespace } from '@reown/appkit-common-react-native';
import { PACKAGE_VERSION } from './constants';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { ProviderUtil } from './store';
// import { useAppKitNetworkCore } from '@reown/appkit-core/react';
// import type { AppKitNetwork } from '@reown/appkit/networks';

// -- Views ------------------------------------------------------------
// export * from '@reown/appkit-scaffold-ui';

export * from './utils/index';
export type * from '@reown/appkit-core-react-native';
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common-react-native';
export { CoreHelperUtil, AccountController } from '@reown/appkit-core-react-native';

export * from './adapters/index';

export * from './auth-provider/index';

export let modal: AppKit | undefined;

type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>;

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    //TODO: CHECK THIS
    modal = new AppKit({
      ...options,
      sdkType: 'appkit',
      sdkVersion: CoreHelperUtil.generateSdkVersion(
        options.adapters ?? [],
        PACKAGE_VERSION
      ) as SdkVersion
    });
    getAppKit(modal);
  }

  return modal;
}

export { AppKit };
export type { AppKitOptions };

// -- Hooks ------------------------------------------------------------
export function getAppKit(appKit: AppKit) {
  if (appKit) {
    modal = appKit;
  }
}

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

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" hook');
  }

  const [state, setState] = useState(modal.getState());

  useEffect(() => {
    const unsubscribe = modal?.subscribeState(newState => {
      setState({ ...newState });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return state;
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

export function useAppKitNetwork(): UseAppKitNetworkReturn {
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore();

  function switchNetwork(network: AppKitNetwork) {
    modal?.switchNetwork(network);
  }

  return {
    caipNetwork,
    caipNetworkId,
    chainId,
    switchNetwork
  };
}

export function useAppKitNetworkCore(): Pick<
  UseAppKitNetworkReturn,
  'caipNetwork' | 'chainId' | 'caipNetworkId'
> {
  const { activeCaipNetwork } = useSnapshot(ChainController.state);

  return {
    caipNetwork: activeCaipNetwork,
    chainId: activeCaipNetwork?.id,
    caipNetworkId: activeCaipNetwork?.caipNetworkId
  };
}

export function useAppKitAccount(): UseAppKitAccountReturn {
  const { status } = useSnapshot(AccountController.state);
  const { activeCaipAddress } = useSnapshot(ChainController.state);

  return {
    caipAddress: activeCaipAddress,
    address: CoreHelperUtil.getPlainAddress(activeCaipAddress),
    isConnected: Boolean(activeCaipAddress),
    status
  };
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect();
  }

  return { disconnect };
}

export function useAppKitProvider<T>(chainNamespace: ChainNamespace) {
  const { providers, providerIds } = useSnapshot(ProviderUtil.state);

  const walletProvider = providers[chainNamespace] as T;
  const walletProviderType = providerIds[chainNamespace];

  return {
    walletProvider,
    walletProviderType
  };
}
