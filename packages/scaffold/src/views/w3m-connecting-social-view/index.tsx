import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  RouterController,
  SnackController,
  WebviewController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import { FlexView, LoadingThumbnail, IconBox, Logo, Text } from '@reown/appkit-ui-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingSocialView() {
  const { maxWidth: width } = useCustomDimensions();
  const { processingAuth } = useSnapshot(WebviewController.state);
  const { selectedSocialProvider } = useSnapshot(ConnectionController.state);
  const authConnector = ConnectorController.getAuthConnector();
  const [error, setError] = useState(false);
  const provider = authConnector?.provider as AppKitFrameProvider;

  const onConnect = useCallback(async () => {
    try {
      if (
        !WebviewController.state.connecting &&
        provider &&
        ConnectionController.state.selectedSocialProvider
      ) {
        const { uri } = await provider.getSocialRedirectUri({
          provider: ConnectionController.state.selectedSocialProvider
        });

        WebviewController.setWebviewUrl(uri);
        WebviewController.setWebviewVisible(true);
        WebviewController.setConnecting(true);
        WebviewController.setConnectingProvider(ConnectionController.state.selectedSocialProvider);
      }
    } catch (e) {
      WebviewController.setWebviewVisible(false);
      WebviewController.setWebviewUrl(undefined);
      WebviewController.setConnecting(false);
      WebviewController.setConnectingProvider(undefined);
      SnackController.showError('Something went wrong');
      setError(true);
    }
  }, [provider]);

  const socialMessageHandler = useCallback(
    async (url: string) => {
      try {
        if (
          url.includes('/sdk/oauth') &&
          ConnectionController.state.selectedSocialProvider &&
          authConnector &&
          !WebviewController.state.processingAuth
        ) {
          WebviewController.setProcessingAuth(true);
          WebviewController.setWebviewVisible(false);
          const parsedUrl = new URL(url);

          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
            properties: { provider: ConnectionController.state.selectedSocialProvider }
          });

          await provider?.connectSocial(parsedUrl.search);
          await ConnectionController.connectExternal(authConnector);
          ConnectionController.setConnectedSocialProvider(
            ConnectionController.state.selectedSocialProvider
          );
          WebviewController.setConnecting(false);

          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_SUCCESS',
            properties: { provider: ConnectionController.state.selectedSocialProvider }
          });

          ModalController.close();
          WebviewController.reset();
        }
      } catch (e) {
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_ERROR',
          properties: { provider: ConnectionController.state.selectedSocialProvider! }
        });
        WebviewController.reset();
        RouterController.goBack();
        SnackController.showError('Something went wrong');
      }
    },
    [authConnector, provider]
  );

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  useEffect(() => {
    if (!provider) return;

    const unsubscribe = provider?.getEventEmitter().addListener('social', socialMessageHandler);

    return () => {
      unsubscribe.removeListener('social', socialMessageHandler);
    };
  }, [socialMessageHandler, provider]);

  return (
    <FlexView
      alignItems="center"
      alignSelf="center"
      padding={['2xl', 'l', '3xl', 'l']}
      style={{ width }}
    >
      <LoadingThumbnail paused={!!error}>
        <Logo logo={selectedSocialProvider ?? 'more'} height={72} width={72} />
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
        {processingAuth
          ? 'Loading user data'
          : `Continue with ${StringUtil.capitalize(selectedSocialProvider)}`}
      </Text>
      <Text variant="small-400" color="fg-200">
        {processingAuth
          ? 'Please wait a moment while we load your data'
          : 'Connect in the provider window'}
      </Text>
    </FlexView>
  );
}
