import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  OptionsController,
  EventsController,
  ConstantsUtil
} from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  LoadingThumbnail,
  WalletImage,
  Link,
  IconBox
} from '@web3modal/ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody } from './components/Body';
import { StoreLink } from './components/StoreLink';
import styles from './styles';

interface Props {
  onRetry: () => void;
  onCopyUri: (uri?: string) => void;
  isInstalled?: boolean;
}

export function ConnectingMobile({ onRetry, onCopyUri, isInstalled }: Props) {
  const { data } = useSnapshot(RouterController.state);
  const { maxWidth: width } = useCustomDimensions();
  const { wcUri, wcError } = useSnapshot(ConnectionController.state);
  const [errorType, setErrorType] = useState<'linking' | 'default' | undefined>();
  const [isRetrying, setIsRetrying] = useState(false);
  const [ready, setReady] = useState(false);
  const showCopy = OptionsController.isClipboardAvailable() && errorType !== 'linking';
  const showRetry = errorType !== 'linking';

  const storeUrl = Platform.select({
    ios: data?.wallet?.app_store,
    android: data?.wallet?.play_store
  });

  const onRetryPress = () => {
    onRetry();
    setIsRetrying(true);
  };

  const onStorePress = () => {
    if (storeUrl) {
      CoreHelperUtil.openLink(storeUrl);
    }
  };

  const onConnect = useCallback(async () => {
    try {
      const { name, mobile_link } = data?.wallet ?? {};
      if (name && mobile_link && wcUri) {
        setErrorType(undefined);
        ConnectionController.setWcError(false);
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, wcUri);
        ConnectionController.setWcLinking({ name, href });
        ConnectionController.setPressedWallet(data?.wallet);
        await CoreHelperUtil.openLink(redirect);
        await ConnectionController.state.wcPromise;

        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: {
            method: 'mobile',
            name: data?.wallet?.name ?? 'Unknown'
          }
        });
      }
    } catch (error: any) {
      if (error.message.includes(ConstantsUtil.LINKING_ERROR)) {
        setErrorType('linking');
      } else {
        setErrorType('default');
      }
    }
  }, [data?.wallet, wcUri]);

  useEffect(() => {
    // First connection
    if (!ready && wcUri) {
      setReady(true);
      onConnect();
    }
  }, [ready, wcUri, onConnect]);

  useEffect(() => {
    if (isRetrying) {
      setIsRetrying(false);
      onConnect();
    }
  }, [wcUri, isRetrying, onConnect]);

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} contentContainerStyle={styles.container}>
      <FlexView
        alignItems="center"
        alignSelf="center"
        padding={['2xl', 'l', '0', 'l']}
        style={{ width }}
      >
        <LoadingThumbnail paused={!!errorType || wcError}>
          <WalletImage
            size="lg"
            imageSrc={AssetUtil.getWalletImage(data?.wallet)}
            imageHeaders={ApiController._getApiHeaders()}
          />
          {wcError && (
            <IconBox
              icon={'close'}
              border
              background
              backgroundColor="icon-box-bg-error-100"
              size="sm"
              iconColor="error-100"
              style={styles.errorIcon}
            />
          )}
        </LoadingThumbnail>
        <ConnectingBody errorType={errorType} wcError={wcError} walletName={data?.wallet?.name} />
        {showRetry && (
          <Button
            variant="accent"
            iconLeft="refresh"
            style={styles.retryButton}
            iconStyle={styles.retryIcon}
            onPress={onRetryPress}
          >
            Try again
          </Button>
        )}
      </FlexView>
      {showCopy && (
        <Link
          iconLeft="copySmall"
          color="fg-200"
          style={styles.copyButton}
          onPress={() => onCopyUri(wcUri)}
        >
          Copy link
        </Link>
      )}
      <StoreLink
        visible={!isInstalled && !!storeUrl}
        walletName={data?.wallet?.name}
        onPress={onStorePress}
      />
    </ScrollView>
  );
}
