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
  type Platform,
  OptionsController,
  ApiController,
  EventsController,
  ConnectorController
} from '@reown/appkit-core-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';
import { useAppKit } from '@reown/appkit-react-native';

import { ConnectingQrCode } from '../../partials/w3m-connecting-qrcode';
import { ConnectingMobile } from '../../partials/w3m-connecting-mobile';
import { ConnectingWeb } from '../../partials/w3m-connecting-web';
import { ConnectingHeader } from '../../partials/w3m-connecting-header';
import { UiUtil } from '../../utils/UiUtil';

export function ConnectingView() {
  const { appKit } = useAppKit();
  const { installed } = useSnapshot(ApiController.state);
  const { data } = RouterController.state;
  const [lastRetry, setLastRetry] = useState(Date.now());
  const isQr = !data?.wallet;
  const isInstalled = !!installed?.find(wallet => wallet.id === data?.wallet?.id);

  const [platform, setPlatform] = useState<Platform>();
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const onRetry = () => {
    if (CoreHelperUtil.isAllowedRetry(lastRetry)) {
      setLastRetry(Date.now());
      ConnectionController.clearUri();
      initializeConnection(true);
    } else {
      SnackController.showError('Please wait a second before retrying');
    }
  };

  const initializeConnection = async (retry = false) => {
    try {
      const { wcPairingExpiry } = ConnectionController.state;
      const { data: routeData } = RouterController.state;
      if (retry || CoreHelperUtil.isPairingExpired(wcPairingExpiry)) {
        ConnectionController.setWcError(false);
        // ConnectionController.connectWalletConnect(routeData?.wallet?.link_mode ?? undefined);
        appKit?.connect('walletconnect', ['eip155']);
        await ConnectionController.state.wcPromise;
        ConnectorController.setConnectedConnector('WALLET_CONNECT');
        AccountController.setIsConnected(true);

        if (OptionsController.state.isSiweEnabled) {
          if (SIWEController.state.status === 'success') {
            ModalController.close();
          } else {
            RouterController.push('ConnectingSiwe');
          }
        } else {
          ModalController.close();
        }
      }
    } catch (error) {
      ConnectionController.setWcError(true);
      ConnectionController.clearUri();
      SnackController.showError('Declined');
      if (isQr && CoreHelperUtil.isAllowedRetry(lastRetry)) {
        setLastRetry(Date.now());
        initializeConnection(true);
      }
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: {
          message: (error as Error)?.message ?? 'Unknown'
        }
      });
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
    if (isQr) {
      return <ConnectingQrCode />;
    }

    switch (platform) {
      case 'mobile':
        return (
          <ConnectingMobile onRetry={onRetry} onCopyUri={onCopyUri} isInstalled={isInstalled} />
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
    let _interval: NodeJS.Timeout;

    // Check if the pairing expired every 10 seconds. If expired, it will create a new uri.
    if (isQr) {
      _interval = setInterval(initializeConnection, ConstantsUtil.TEN_SEC_MS);
    }

    return () => clearInterval(_interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQr]);

  return (
    <>
      {headerTemplate()}
      {platformTemplate()}
    </>
  );
}
