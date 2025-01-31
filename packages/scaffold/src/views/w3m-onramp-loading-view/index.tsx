import { useEffect } from 'react';
import { Linking, ScrollView } from 'react-native';
import {
  RouterController,
  OnRampController,
  SnackController,
  ConnectorController,
  OptionsController,
  AccountController
} from '@reown/appkit-core-react-native';
import { FlexView, Icon, LoadingThumbnail } from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody } from '../../partials/w3m-connecting-body';
import styles from './styles';

export function OnRampLoadingView() {
  const { maxWidth: width } = useCustomDimensions();

  useEffect(() => {
    const unsubscribe = Linking.addEventListener('url', ({ url }) => {
      const metadata = OptionsController.state.metadata;
      const isAuth = ConnectorController.state.connectedConnector === 'AUTH';
      if (
        url.startsWith(metadata?.redirect?.universal ?? '') ||
        url.startsWith(metadata?.redirect?.native ?? '')
      ) {
        SnackController.showSuccess('Onramp started');
        RouterController.replace(isAuth ? 'Account' : 'AccountDefault');
        OnRampController.resetState();
        AccountController.fetchTokenBalance();
      }
    });

    return () => unsubscribe.remove();
  }, []);

  useEffect(() => {
    const onConnect = async () => {
      if (OnRampController.state.selectedQuote) {
        const response = await OnRampController.getWidget({
          quote: OnRampController.state.selectedQuote
        });
        if (response?.widgetUrl) {
          Linking.openURL(response?.widgetUrl);
        }
      }
    };

    onConnect();
  }, []);

  //TODO: idea -> show retry after 2mins

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} contentContainerStyle={styles.container}>
      <FlexView
        alignItems="center"
        alignSelf="center"
        padding={['2xl', 'l', '0', 'l']}
        style={{ width }}
      >
        <LoadingThumbnail>
          <Icon name="browser" size="xl" height={50} width={50} color="accent-100" />
        </LoadingThumbnail>
        <ConnectingBody
          title="Complete the payment on your browser"
          description="Please wait while we redirect you to the payment page."
        />
      </FlexView>
    </ScrollView>
  );
}
