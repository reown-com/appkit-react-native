import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import {
  ConnectorController,
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
  const { data } = RouterController.state;
  const { maxWidth: width } = useCustomDimensions();
  const { connecting } = useSnapshot(WebviewController.state);
  const authConnector = ConnectorController.getAuthConnector();
  const [error, setError] = useState(false);
  const socialProvider = data?.socialProvider;
  const provider = authConnector?.provider as AppKitFrameProvider;

  const onConnect = useCallback(async () => {
    try {
      if (!WebviewController.state.connecting && provider && socialProvider) {
        const { uri } = await provider.getSocialRedirectUri({
          provider: socialProvider
        });
        WebviewController.setWebviewUrl(uri);
        WebviewController.setWebviewVisible(true);
        WebviewController.setConnecting(true);
      }
    } catch (e) {
      WebviewController.setWebviewVisible(false);
      WebviewController.setConnecting(false);
      SnackController.showError('Something went wrong');
      setError(true);
    }
  }, [provider, socialProvider]);

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
      <LoadingThumbnail paused={!!error}>
        <Logo logo={socialProvider ?? 'more'} height={72} width={72} />
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
        {`Continue with ${StringUtil.capitalize(socialProvider)}`}
      </Text>
      <Text variant="small-400" color="fg-200">
        {connecting ? 'Connecting...' : 'Connect in the provider window'}
      </Text>
    </FlexView>
  );
}
