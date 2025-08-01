import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  WcController,
  CoreHelperUtil,
  OptionsController,
  EventsController,
  ConstantsUtil
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  LoadingThumbnail,
  WalletImage,
  Link,
  IconBox
} from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { StoreLink } from './components/StoreLink';
import { ConnectingBody, getMessage, type BodyErrorType } from '../w3m-connecting-body';
import styles from './styles';

interface Props {
  onRetry: () => void;
  onCopyUri: (uri?: string) => void;
  isInstalled?: boolean;
}

export function ConnectingMobile({ onRetry, onCopyUri, isInstalled }: Props) {
  const { data } = RouterController.state;
  const { maxWidth: width } = useCustomDimensions();
  const { wcUri, wcError } = useSnapshot(WcController.state);
  const [errorType, setErrorType] = useState<BodyErrorType>();
  const showCopy =
    OptionsController.isClipboardAvailable() &&
    errorType !== 'not_installed' &&
    !CoreHelperUtil.isLinkModeURL(wcUri);

  const showRetry = errorType !== 'not_installed';
  const bodyMessage = getMessage({ walletName: data?.wallet?.name, errorType, declined: wcError });

  const storeUrl = Platform.select({
    ios: data?.wallet?.app_store,
    android: data?.wallet?.play_store
  });

  const onRetryPress = () => {
    setErrorType(undefined);
    WcController.setWcError(false);
    onRetry?.();
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
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, wcUri);
        const wcLinking = { name, href };
        WcController.setWcLinking(wcLinking);
        WcController.setPressedWallet(data?.wallet);
        await CoreHelperUtil.openLink(redirect);
        await WcController.state.wcPromise;
        WcController.setConnectedWallet(wcLinking, data?.wallet);
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: {
            method: 'mobile',
            name: data?.wallet?.name ?? 'Unknown',
            explorer_id: data?.wallet?.id
          }
        });
      }
    } catch (error: any) {
      if (error.message.includes(ConstantsUtil.LINKING_ERROR)) {
        setErrorType('not_installed');
      } else {
        setErrorType('default');
      }
    }
  }, [wcUri, data]);

  useEffect(() => {
    if (wcUri) {
      onConnect();
    }
  }, [wcUri, onConnect]);

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
            size="xl"
            imageSrc={AssetUtil.getWalletImage(RouterController.state.data?.wallet)}
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
        <ConnectingBody title={bodyMessage.title} description={bodyMessage.description} />
        {showRetry && (
          <Button
            size="sm"
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
