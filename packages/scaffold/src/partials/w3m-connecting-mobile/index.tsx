import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  ConnectionController,
  CoreHelperUtil
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

import { useDimensions } from '../../hooks/useDimensions';
import styles from './styles';

interface Props {
  onRetry: () => void;
  onCopyUri: (uri?: string) => void;
  isInstalled?: boolean;
}

export function ConnectingMobile({ onRetry, onCopyUri, isInstalled }: Props) {
  const { data } = useSnapshot(RouterController.state);
  const { width } = useDimensions();
  const { wcUri, wcError } = useSnapshot(ConnectionController.state);
  const [linkingError, setLinkingError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [ready, setReady] = useState(false);

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
        <FlexView padding={['0', '2xl', '0', '2xl']} alignItems="center" gap="xs">
          <Text variant="paragraph-500">{`${walletName} is not installed`}</Text>
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            {`To connect with ${walletName}, install the application on your device`}
          </Text>
        </FlexView>
      );
    } else if (wcError) {
      return (
        <FlexView padding={['0', '2xl', '0', '2xl']} alignItems="center" gap="xs">
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
      <FlexView padding={['0', '2xl', '0', '2xl']} alignItems="center" gap="xs">
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
          iconRight="chevronRight"
          iconSize="xs"
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
    <ScrollView bounces={false} fadingEdgeLength={20}>
      <FlexView
        alignItems="center"
        alignSelf="center"
        rowGap="xs"
        padding={['2xl', 'l', '2xl', 'l']}
        style={{ width }}
      >
        <LoadingThumbnail paused={linkingError || wcError}>
          <WalletImage
            size="lg"
            imageSrc={AssetUtil.getWalletImage(data?.wallet)}
            imageHeaders={ApiController._getApiHeaders()}
          />
          {(wcError || linkingError) && (
            <IconBox
              icon={linkingError ? 'warningCircle' : 'close'}
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
        <Button
          variant="accent"
          iconLeft="refresh"
          style={styles.retryButton}
          iconStyle={styles.retryIcon}
          onPress={onRetryPress}
        >
          Try again
        </Button>
        <Link
          iconLeft="copy"
          color="fg-200"
          style={styles.copyButton}
          onPress={() => onCopyUri(wcUri)}
        >
          Copy link
        </Link>
      </FlexView>
      {storeTemplate()}
    </ScrollView>
  );
}
