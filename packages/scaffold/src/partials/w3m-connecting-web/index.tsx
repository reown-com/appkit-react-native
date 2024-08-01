import { useSnapshot } from 'valtio';
import { useCallback } from 'react';
import { Linking, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  OptionsController,
  EventsController
} from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  LoadingThumbnail,
  WalletImage,
  Link,
  IconBox
} from '@web3modal/ui-react-native';

import { ConnectingBody } from './components/Body';
import styles from './styles';
import { UiUtil } from '../../utils/UiUtil';

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
        const wcLinking = { name, href };
        ConnectionController.setWcLinking(wcLinking);
        ConnectionController.setPressedWallet(data?.wallet);
        await Linking.openURL(redirect);
        await ConnectionController.state.wcPromise;

        UiUtil.storeConnectedWallet(wcLinking, data?.wallet);

        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: {
            method: 'web',
            name: data?.wallet?.name ?? 'Unknown'
          }
        });
      }
    } catch {}
  }, [data?.wallet, wcUri]);

  return (
    <ScrollView bounces={false} fadingEdgeLength={20}>
      <FlexView alignItems="center" padding={['2xl', 'm', '3xl', 'm']}>
        <LoadingThumbnail paused={wcError}>
          <WalletImage
            size="xl"
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
        <ConnectingBody wcError={wcError} walletName={data?.wallet?.name} />
        <Button
          size="sm"
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
