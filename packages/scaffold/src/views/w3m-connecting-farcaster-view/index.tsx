import { Linking } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ConnectionController,
  ConnectorController,
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

export function ConnectingFarcasterView() {
  const { data } = RouterController.state;
  const { maxWidth: width } = useCustomDimensions();
  const authConnector = ConnectorController.getAuthConnector();
  const [error, setError] = useState(false);
  const socialProvider = data?.socialProvider;
  const provider = authConnector?.provider as AppKitFrameProvider;

  const onConnect = useCallback(async () => {
    try {
      if (!WebviewController.state.connecting && provider && socialProvider && authConnector) {
        setError(false);
        const { url } = await provider.getFarcasterUri();
        await Linking.openURL(url);
        await provider.connectFarcaster();
        await ConnectionController.connectExternal(authConnector);
        ConnectionController.setConnectedSocialProvider(socialProvider);
        WebviewController.setConnecting(false);
        ModalController.close();
      }
    } catch (e) {
      SnackController.showError('Something went wrong');
      setError(true);
    }
  }, [provider, socialProvider, authConnector]);

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
          {`Continue with ${StringUtil.capitalize(socialProvider)}`}
        </Text>
      </>
    </FlexView>
  );
}
