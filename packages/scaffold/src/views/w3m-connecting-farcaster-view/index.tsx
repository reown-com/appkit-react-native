import { useSnapshot } from 'valtio';
import { Linking } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  SnackController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import {
  FlexView,
  LoadingThumbnail,
  IconBox,
  Logo,
  Text,
  Link
} from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingFarcasterView() {
  const { maxWidth: width } = useCustomDimensions();
  const { open } = useSnapshot(ModalController.state);
  const authConnector = ConnectorController.getAuthConnector();
  const [error, setError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [url, setUrl] = useState<string | undefined>();
  const showCopy = OptionsController.isClipboardAvailable();
  const provider = authConnector?.provider as AppKitFrameProvider;

  const onConnect = useCallback(async () => {
    try {
      if (provider && authConnector) {
        setError(false);
        const { url: farcasterUrl } = await provider.getFarcasterUri();
        setUrl(farcasterUrl);
        Linking.openURL(farcasterUrl);

        await provider.connectFarcaster();
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
          properties: { provider: 'farcaster' }
        });
        setProcessing(true);
        await ConnectionController.connectExternal(authConnector);
        ConnectionController.setConnectedSocialProvider('farcaster');
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_SUCCESS',
          properties: { provider: 'farcaster' }
        });

        setProcessing(false);
        ModalController.close();
      }
    } catch (e) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_ERROR',
        properties: { provider: 'farcaster' }
      });
      // TODO: remove this once Farcaster session refresh is implemented
      // @ts-expect-error
      provider?.webviewRef?.current?.reload();
      SnackController.showError('Something went wrong');
      setError(true);
      setProcessing(false);
    }
  }, [provider, authConnector]);

  const onCopyUrl = () => {
    if (url) {
      OptionsController.copyToClipboard(url);
      SnackController.showSuccess('Link copied');
    }
  };

  useEffect(() => {
    return () => {
      // TODO: remove this once Farcaster session refresh is implemented
      if (!open) {
        // @ts-expect-error
        provider.webviewRef?.current?.reload();
      }
    };
    // @ts-expect-error
  }, [open, provider.webviewRef]);

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  return (
    <FlexView
      alignItems="center"
      alignSelf="center"
      padding={['2xl', 'l', '3xl', 'l']}
      style={{ width }}
    >
      <>
        <LoadingThumbnail paused={!!error}>
          <Logo logo="farcasterSquare" height={72} width={72} />
          {error && (
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
        <Text style={styles.continueText} variant="paragraph-500">
          {processing ? 'Loading user data' : 'Continue in Farcaster'}
        </Text>
        <Text variant="small-400" color="fg-200">
          {processing
            ? 'Please wait a moment while we load your data'
            : 'Connect in the Farcaster app'}
        </Text>
        {showCopy && (
          <Link
            iconLeft="copySmall"
            color="fg-200"
            style={styles.copyButton}
            onPress={onCopyUrl}
            testID="button-copy-uri"
          >
            Copy link
          </Link>
        )}
      </>
    </FlexView>
  );
}
