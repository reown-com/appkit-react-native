import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  OptionsController
} from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  LoadingThumbnail,
  Text,
  WalletImage,
  Link,
  IconBox,
  ActionEntry
} from '@web3modal/ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
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
  const [linkingError, setLinkingError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [ready, setReady] = useState(false);
  const showCopy = OptionsController.isClipboardAvailable() && !linkingError;

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
      Linking.openURL(storeUrl);
    }
  };

  const onConnect = useCallback(async () => {
    try {
      const { name, mobile_link } = data?.wallet ?? {};
      if (name && mobile_link && wcUri) {
        setLinkingError(false);
        ConnectionController.setWcError(false);
        const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, wcUri);
        ConnectionController.setWcLinking({ name, href });
        ConnectionController.setPressedWallet(data?.wallet);
        await Linking.openURL(redirect);
      }
    } catch (error) {
      setLinkingError(true);
    }
  }, [data?.wallet, wcUri]);

  const textTemplate = () => {
    const walletName = data?.wallet?.name ?? 'Wallet';
    if (linkingError) {
      return (
        <FlexView
          padding={['3xs', '2xl', '0', '2xl']}
          alignItems="center"
          style={styles.textContainer}
        >
          <Text variant="paragraph-500">App not installed</Text>
        </FlexView>
      );
    } else if (wcError) {
      return (
        <FlexView
          padding={['3xs', '2xl', '0', '2xl']}
          alignItems="center"
          style={styles.textContainer}
        >
          <Text variant="paragraph-500" color="error-100">
            Connection declined
          </Text>
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            Connection can be declined if a previous request is still active
          </Text>
        </FlexView>
      );
    }

    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500">{`Continue in ${walletName}`}</Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Accept connection request in the wallet
        </Text>
      </FlexView>
    );
  };

  const storeTemplate = () => {
    if (!storeUrl || isInstalled) return null;

    return (
      <ActionEntry style={styles.storeButton}>
        <Text numberOfLines={1} variant="paragraph-500" color="fg-200">
          {`Don't have ${data?.wallet?.name}?`}
        </Text>
        <Button
          variant="accent"
          iconRight="chevronRightSmall"
          onPress={onStorePress}
          size="sm"
          hitSlop={20}
        >
          Get
        </Button>
      </ActionEntry>
    );
  };

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
        <LoadingThumbnail paused={linkingError || wcError}>
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
        {textTemplate()}
        {!linkingError && (
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
      {storeTemplate()}
    </ScrollView>
  );
}
