import { useSnapshot } from 'valtio';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ErrorUtil, type Platform } from '@reown/appkit-common-react-native';
import {
  WcController,
  ConstantsUtil,
  CoreHelperUtil,
  RouterController,
  SnackController,
  OptionsController,
  ApiController,
  EventsController,
  LogController
} from '@reown/appkit-core-react-native';
import { useInternalAppKit } from '../../AppKitContext';
import { ConnectingQrCode } from '../../partials/w3m-connecting-qrcode';
import { ConnectingMobile } from '../../partials/w3m-connecting-mobile';
import { ConnectingWeb } from '../../partials/w3m-connecting-web';
import { ConnectingHeader } from '../../partials/w3m-connecting-header';

export function ConnectingView() {
  const { connect } = useInternalAppKit();
  const { installed } = useSnapshot(ApiController.state);
  const { data } = RouterController.state;
  const lastRetryRef = useRef<number>(Date.now());
  const isQr = !data?.wallet;
  const isInstalled = !!installed?.find(wallet => wallet.id === data?.wallet?.id);

  const [platform, setPlatform] = useState<Platform>();
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const onRetry = () => {
    if (CoreHelperUtil.isAllowedRetry(lastRetryRef.current)) {
      lastRetryRef.current = Date.now();
      initializeConnection(true);
    } else {
      SnackController.showError('Please wait a second before retrying');
    }
  };

  const initializeConnection = async (retry = false) => {
    try {
      const { wcPairingExpiry } = WcController.state;
      const { data: routeData } = RouterController.state;
      const isPairingExpired = CoreHelperUtil.isPairingExpired(wcPairingExpiry);
      if (retry || isPairingExpired) {
        WcController.setWcError(false);
        WcController.clearUri();

        const connectPromise = connect({
          wallet: routeData?.wallet
        });
        WcController.setWcPromise(connectPromise);
        await connectPromise;
      }
    } catch (error) {
      LogController.sendError(error, 'ConnectingView.tsx', 'initializeConnection');
      WcController.setWcError(true);

      const isUserRejected = ErrorUtil.isUserRejectedRequestError(error);
      const isProposalExpired = ErrorUtil.isProposalExpiredError(error);
      if (!isProposalExpired) {
        SnackController.showError(
          isUserRejected ? 'User rejected the request' : 'Something went wrong'
        );
      }

      EventsController.sendEvent({
        type: 'track',
        event: isUserRejected ? 'USER_REJECTED' : 'CONNECT_ERROR',
        properties: {
          message: (error as Error)?.message ?? 'Unknown'
        }
      });

      if (isQr && CoreHelperUtil.isAllowedRetry(lastRetryRef.current)) {
        lastRetryRef.current = Date.now();
        initializeConnection(true);
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
    setPlatform(tab);
  };

  useLayoutEffect(() => {
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
    initializeConnection(true);
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
      {platforms.length > 1 ? (
        <ConnectingHeader platforms={platforms} onSelectPlatform={onSelectPlatform} />
      ) : null}
      {isQr ? (
        <ConnectingQrCode />
      ) : platform === 'mobile' ? (
        <ConnectingMobile onRetry={onRetry} onCopyUri={onCopyUri} isInstalled={isInstalled} />
      ) : platform === 'web' ? (
        <ConnectingWeb onCopyUri={onCopyUri} />
      ) : null}
    </>
  );
}
