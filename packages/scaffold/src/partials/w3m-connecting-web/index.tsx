import { useSnapshot } from 'valtio';
import { useCallback } from 'react';
import { Linking, ScrollView } from 'react-native';
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
  IconBox
} from '@web3modal/ui-react-native';

import styles from './styles';

interface ConnectingWebProps {
  onCopyUri: (uri?: string) => void;
}

export function ConnectingWeb({ onCopyUri }: ConnectingWebProps) {
  const { data } = useSnapshot(RouterController.state);
  const { wcUri, wcError } = useSnapshot(ConnectionController.state);
  const showCopy = OptionsController.isClipboardAvailable();

  const onConnect = useCallback(async () => {
    try {
      const { name, webapp_link } = data?.wallet ?? {};
      if (name && webapp_link && wcUri) {
        ConnectionController.setWcError(false);
        const { redirect, href } = CoreHelperUtil.formatUniversalUrl(webapp_link, wcUri);
        ConnectionController.setWcLinking({ name, href });
        ConnectionController.setPressedWallet(data?.wallet);
        await Linking.openURL(redirect);
      }
    } catch {}
  }, [data?.wallet, wcUri]);

  const textTemplate = () => {
    const walletName = data?.wallet?.name ?? 'Wallet';
    if (wcError) {
      return (
        <>
          <Text variant="paragraph-500" color="error-100" style={styles.mainText}>
            Connection declined
          </Text>
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            Connection can be declined if a previous request is still active
          </Text>
        </>
      );
    }

    return (
      <>
        <Text variant="paragraph-500" style={styles.mainText}>{`Continue in ${walletName}`}</Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Open and continue in a browser tab
        </Text>
      </>
    );
  };

  return (
    <ScrollView bounces={false} fadingEdgeLength={20}>
      <FlexView alignItems="center" padding={['2xl', 'm', '3xl', 'm']}>
        <LoadingThumbnail paused={wcError}>
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
        <Button
          variant="accent"
          iconRight="externalLink"
          style={styles.openButton}
          onPress={onConnect}
        >
          Open
        </Button>
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
      </FlexView>
    </ScrollView>
  );
}
