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
  StorageUtil,
  type Platform,
  OptionsController,
  ApiController
} from '@web3modal/core-react-native';

import { ConnectingQrCode } from '../../partials/w3m-connecting-qrcode';
import { ConnectingMobile } from '../../partials/w3m-connecting-mobile';
import { ConnectingWeb } from '../../partials/w3m-connecting-web';
import { ConnectingHeader } from '../../partials/w3m-connecting-header';
import { UiUtil } from '../../utils/UiUtil';

export function ConnectingView() {
  const { installed } = useSnapshot(ApiController.state);
  const { data } = useSnapshot(RouterController.state);
  const [lastRetry, setLastRetry] = useState(Date.now());
  const isQr = !data?.wallet;
  const isInstalled = !!installed?.find(wallet => wallet.id === data?.wallet?.id);

  const [platform, setPlatform] = useState<Platform>();
  const [platforms, setPlatforms] = useState<Platform[]>([]);

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

  const onCopyUri = (uri?: string) => {
    if (OptionsController.isClipboardAvailable() && uri) {
      OptionsController.copyToClipboard(uri);
      SnackController.showSuccess('Link copied');
    }
  };

  const onSelectPlatform = (tab: Platform) => {
    UiUtil.createViewTransition();
    setPlatform(tab);
  };

  const headerTemplate = () => {
    if (isQr) return null;

    if (platforms.length > 1) {
      return <ConnectingHeader platforms={platforms} onSelectPlatform={onSelectPlatform} />;
    }

    return null;
  };

  const platformTemplate = () => {
    switch (platform) {
      case 'mobile':
        return (
          <ConnectingMobile
            onRetry={() => initializeConnection(true)}
            onCopyUri={onCopyUri}
            isInstalled={isInstalled}
          />
        );
      case 'web':
        return <ConnectingWeb onCopyUri={onCopyUri} />;
      default:
        return undefined;
    }
  };

  useEffect(() => {
    const _platforms: Platform[] = [];
    if (data?.wallet?.mobile_link) {
      _platforms.push('mobile');
    }
    if (data?.wallet?.webapp_link && !isInstalled) {
      _platforms.push('web');
    }

    setPlatforms(_platforms);
    setPlatform(_platforms[0]);
  }, [data, isInstalled]);

  useEffect(() => {
    initializeConnection();
    const _interval = setInterval(initializeConnection, ConstantsUtil.TEN_SEC_MS);

    return () => clearInterval(_interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data?.wallet) return <ConnectingQrCode />;

  return (
    <>
      {headerTemplate()}
      {platformTemplate()}
    </>
  );
}
