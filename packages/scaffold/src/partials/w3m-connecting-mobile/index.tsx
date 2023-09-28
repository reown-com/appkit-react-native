import { useSnapshot } from 'valtio';
import { Linking, Platform } from 'react-native';
import { useEffect, useState } from 'react';
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
  Separator,
  ListItem,
  Link
} from '@web3modal/ui-react-native';

import styles from './styles';

interface Props {
  onRetry: () => void;
}

export function ConnectingMobile({ onRetry }: Props) {
  const { data } = useSnapshot(RouterController.state);
  const { wcUri, wcError } = useSnapshot(ConnectionController.state);
  const [isRetrying, setIsRetrying] = useState(false);
  const [ready, setReady] = useState(false);

  const storeUrl = Platform.select({
    ios: data?.wallet?.app_store,
    android: data?.wallet?.play_store
  });

  const onRetryPress = () => {
    onRetry();
    setIsRetrying(true);
    ConnectionController.setWcError(false);
  };

  const onStorePress = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  const onConnect = () => {
    const { name, mobile_link } = data?.wallet ?? {};
    if (name && mobile_link && wcUri) {
      const { redirect, href } = CoreHelperUtil.formatNativeUrl(mobile_link, wcUri);
      ConnectionController.setWcLinking({ name, href });
      ConnectionController.setRecentWallet(data?.wallet);
      Linking.openURL(redirect);
    }
  };

  useEffect(() => {
    // First connection
    if (!ready && wcUri) {
      setReady(true);
      // onConnect();
    }
  }, [ready, wcUri]);

  useEffect(() => {
    if (isRetrying) {
      setIsRetrying(false);
      onConnect();
    }
  }, [wcUri]);

  return (
    <FlexView alignItems="center" rowGap="xs" padding={['2xl', '0', 'm', '0']}>
      <LoadingThumbnail showError={wcError}>
        <WalletImage
          size="lg"
          imageSrc={AssetUtil.getWalletImage(data?.wallet)}
          imageHeaders={ApiController._getApiHeaders()}
        />
      </LoadingThumbnail>
      <Text variant="paragraph-500">{`Continue in ${data?.wallet?.name ?? 'Wallet'}`}</Text>
      <Text variant="small-500" color="fg-200">
        Accept connection request in the wallet
      </Text>
      {wcError && (
        <Button
          variant="accent"
          iconLeft="refresh"
          style={styles.retryButton}
          iconStyle={styles.copyIcon}
          onPress={onRetryPress}
        >
          Try again
        </Button>
      )}
      <Link iconLeft="copy" color="fg-200" style={styles.copyButton} onPress={() => {}}>
        Copy link
      </Link>

      {/* TODO: Add installed condition */}
      {storeUrl && (
        <>
          <Separator />
          <ListItem
            variant="icon"
            iconVariant="square"
            onPress={onStorePress}
            icon={Platform.select({ ios: 'appStore', android: 'playStore' })}
            style={styles.storeButton}
            chevron
          >
            <Text>Get the app</Text>
          </ListItem>
        </>
      )}
    </FlexView>
  );
}
