import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import {
  AccountController,
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController,
  StorageUtil
} from '@web3modal/core-react-native';

import { ConnectingQrCode } from '../../partials/w3m-connecting-qrcode';
import { ConnectingMobile } from '../../partials/w3m-connecting-mobile';

export function ConnectingView() {
  const { data } = useSnapshot(RouterController.state);
  const [lastRetry, setLastRetry] = useState(Date.now());

  const initializeConnection = async (retry = false) => {
    try {
      const { wcPairingExpiry } = ConnectionController.state;
      if (retry || CoreHelperUtil.isPairingExpired(wcPairingExpiry)) {
        ConnectionController.connectWalletConnect();
        await ConnectionController.state.wcPromise;
        storeWalletConnectDeeplink();
        AccountController.setIsConnected(true);
        ModalController.close();
      }
    } catch {
      ConnectionController.setWcError(true);
      if (CoreHelperUtil.isAllowedRetry(lastRetry)) {
        SnackController.showError('Declined');
        setLastRetry(Date.now());
        initializeConnection(true);
      }
    }
  };

  const storeWalletConnectDeeplink = async () => {
    const { wcLinking, pressedWallet } = ConnectionController.state;
    if (wcLinking) {
      StorageUtil.setWalletConnectDeepLink(wcLinking);
    }
    if (pressedWallet) {
      const recentWallets = await StorageUtil.setWeb3ModalRecent(pressedWallet);
      if (recentWallets) {
        ConnectionController.setRecentWallets(recentWallets);
      }
    }
  };

  useEffect(() => {
    initializeConnection();
    const _interval = setInterval(initializeConnection, ConstantsUtil.TEN_SEC_MS);

    return () => clearInterval(_interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data?.wallet) return <ConnectingQrCode />;

  return <ConnectingMobile onRetry={() => initializeConnection(true)} />;
}
