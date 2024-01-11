import '@walletconnect/react-native-compat';
import { useSnapshot } from 'valtio';
import { ethers } from 'ethers';
import '@ethersproject/shims';
export {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton,
  Web3Modal
} from '@web3modal/scaffold-react-native';
import { ConstantsUtil, EthersStoreUtil } from '@web3modal/scaffold-utils-react-native';
export { defaultConfig } from './utils/defaultConfig';
import { useEffect, useState } from 'react';
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

export function useWeb3ModalProvider() {
  const { provider, providerType } = useSnapshot(EthersStoreUtil.state);

  const walletProvider = provider as ethers.providers.ExternalProvider | undefined;
  const walletProviderType = providerType;

  return {
    walletProvider,
    walletProviderType
  };
}
