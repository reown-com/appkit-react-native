import { useSnapshot } from 'valtio';
import { RouterController, ApiController, AssetUtil } from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  LoadingThumbnail,
  Text,
  WalletImage,
  ActionEntry,
  Separator,
  StoreEntry
} from '@web3modal/ui-react-native';

import styles from './styles';
import { Linking, Platform } from 'react-native';

export function ConnectingView() {
  const { data } = useSnapshot(RouterController.state);
  const storeUrl = Platform.select({
    ios: data?.wallet?.app_store,
    android: data?.wallet?.play_store
  });

  const onStorePress = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <FlexView alignItems="center" rowGap="xs" padding={['2xl', '0', 'm', '0']}>
      <LoadingThumbnail>
        <WalletImage
          size="lg"
          imageSrc={AssetUtil.getWalletImage(data?.wallet)}
          imageHeaders={ApiController._getApiHeaders()}
        />
      </LoadingThumbnail>
      <Text style={styles.title} variant="paragraph-500">{`Continue in ${
        data?.wallet?.name ?? 'Wallet'
      }`}</Text>
      <Text variant="small-500" color="fg-200">
        Accept connection request in the wallet
      </Text>
      <Button variant="accent" iconLeft="refresh" style={styles.retryButton}>
        Try again
      </Button>
      <ActionEntry label="Copy link" iconLeft="copy" style={styles.copyButton} />

      {/* TODO: Add installed condition */}
      {storeUrl && (
        <>
          <Separator />
          <StoreEntry
            label="Get the app"
            imageSrc={AssetUtil.getWalletImage(data?.wallet)} //TODO: Replace with stores image
            imageHeaders={ApiController._getApiHeaders()}
            onPress={onStorePress}
            style={styles.storeButton}
          />
        </>
      )}
    </FlexView>
  );
}
