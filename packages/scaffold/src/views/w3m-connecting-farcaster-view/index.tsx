import { Linking } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  WebviewController,
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
  const { data } = RouterController.state;
  const { maxWidth: width } = useCustomDimensions();
  const authConnector = ConnectorController.getAuthConnector();
  const [error, setError] = useState(false);
  const [_url, setUrl] = useState<string | undefined>();
  const showCopy = OptionsController.isClipboardAvailable();
  const socialProvider = data?.socialProvider;
  const provider = authConnector?.provider as AppKitFrameProvider;

  const onConnect = useCallback(async () => {
    try {
      if (!WebviewController.state.connecting && provider && socialProvider && authConnector) {
        setError(false);
        const { url } = await provider.getFarcasterUri();
        setUrl(url);
        Linking.openURL(url);
        await provider.connectFarcaster();
        await ConnectionController.connectExternal(authConnector);
        ConnectionController.setConnectedSocialProvider(socialProvider);
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_SUCCESS',
          properties: { provider: socialProvider }
        });
        WebviewController.setConnecting(false);
        ModalController.close();
      }
    } catch (e) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_ERROR',
        properties: { provider: socialProvider! }
      });
      SnackController.showError('Something went wrong');
      setError(true);
    }
  }, [provider, socialProvider, authConnector]);

  const onCopyUrl = () => {
    if (_url) {
      OptionsController.copyToClipboard(_url);
      SnackController.showSuccess('Link copied');
    }
  };

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
          Continue in Farcaster
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
