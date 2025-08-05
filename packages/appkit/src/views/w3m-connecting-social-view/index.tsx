import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import {
  WcController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import { FlexView, LoadingThumbnail, IconBox, Logo, Text } from '@reown/appkit-ui-react-native';
import { ConstantsUtil, StringUtil } from '@reown/appkit-common-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { useInternalAppKit } from '../../AppKitContext';
import styles from './styles';

export function ConnectingSocialView() {
  const { maxWidth: width } = useCustomDimensions();
  const { connect } = useInternalAppKit();
  const { data } = useSnapshot(RouterController.state);
  const { wcUri } = useSnapshot(WcController.state);
  const [error, setError] = useState(false);

  const onConnect = useCallback(async () => {
    try {
      if (wcUri) {
        const { redirect, href } = CoreHelperUtil.formatUniversalUrl(
          ConstantsUtil.WEB_WALLET_URL,
          wcUri,
          RouterController.state.data?.socialProvider
        );
        const wcLinking = { name: 'Reown Wallet', href };
        WcController.setWcLinking(wcLinking);
        await CoreHelperUtil.openLink(redirect);
        await WcController.state.wcPromise;
        WcController.setConnectedWallet(wcLinking);
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_SUCCESS',
          properties: { provider: RouterController.state.data?.socialProvider! }
        });
      }
    } catch (e) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_ERROR',
        properties: { provider: RouterController.state.data?.socialProvider! }
      });
      SnackController.showError('Something went wrong');
      setError(true);
    }
  }, [wcUri]);

  const initializeConnection = useCallback(async () => {
    const connectPromise = connect('walletconnect');
    WcController.setWcPromise(connectPromise);
  }, [connect]);

  useEffect(() => {
    initializeConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wcUri) {
      onConnect();
    }
  }, [wcUri, onConnect]);

  return (
    <FlexView
      alignItems="center"
      alignSelf="center"
      padding={['2xl', 'l', '3xl', 'l']}
      style={{ width }}
    >
      <LoadingThumbnail paused={!!error}>
        <Logo logo={data?.socialProvider ?? 'more'} height={72} width={72} />
        {error ? (
          <IconBox
            icon={'close'}
            border
            background
            backgroundColor="icon-box-bg-error-100"
            size="sm"
            iconColor="error-100"
            style={styles.errorIcon}
          />
        ) : null}
      </LoadingThumbnail>
      <Text style={styles.continueText} variant="paragraph-500">
        Continue with {StringUtil.capitalize(data?.socialProvider ?? 'Login')}
      </Text>
      <Text variant="small-400" color="fg-200">
        Continue in your browser
      </Text>
    </FlexView>
  );
}
