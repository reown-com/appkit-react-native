import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Linking, ScrollView } from 'react-native';
import {
  RouterController,
  OnRampController,
  SnackController,
  ConnectorController,
  OptionsController,
  AccountController
} from '@reown/appkit-core-react-native';
import { FlexView, DoubleImageLoader, IconLink, Button, Text } from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody } from '../../partials/w3m-connecting-body';
import styles from './styles';
import { StringUtil } from '@reown/appkit-common-react-native';

export function OnRampLoadingView() {
  const { maxWidth: width } = useCustomDimensions();
  const { error } = useSnapshot(OnRampController.state);
  const providerName = StringUtil.capitalize(
    OnRampController.state.selectedQuote?.serviceProvider.toLowerCase()
  );

  const serviceProvideLogo = OnRampController.getServiceProviderImage(
    OnRampController.state.selectedQuote?.serviceProvider ?? ''
  );

  const handleGoBack = () => {
    RouterController.goBack();
  };

  const onConnect = useCallback(async () => {
    if (OnRampController.state.selectedQuote) {
      OnRampController.clearError();
      const response = await OnRampController.generateWidget({
        quote: OnRampController.state.selectedQuote
      });
      if (response?.widgetUrl) {
        Linking.openURL(response?.widgetUrl);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = Linking.addEventListener('url', ({ url }) => {
      const metadata = OptionsController.state.metadata;
      const isAuth = ConnectorController.state.connectedConnector === 'AUTH';
      if (
        url.startsWith(metadata?.redirect?.universal ?? '') ||
        url.startsWith(metadata?.redirect?.native ?? '')
      ) {
        SnackController.showLoading('Transaction started');
        RouterController.replace(isAuth ? 'Account' : 'AccountDefault');
        OnRampController.resetState();
        AccountController.fetchTokenBalance();
      }
    });

    return () => unsubscribe.remove();
  }, []);

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} contentContainerStyle={styles.container}>
      <FlexView
        alignItems="center"
        alignSelf="center"
        padding={['2xl', 'l', '0', 'l']}
        style={{ width }}
      >
        <IconLink
          icon="chevronLeft"
          size="md"
          onPress={handleGoBack}
          testID="button-back"
          style={styles.backButton}
        />
        <DoubleImageLoader
          leftImage={OptionsController.state.metadata?.icons[0]}
          rightImage={serviceProvideLogo}
          style={styles.imageContainer}
        />
        {error ? (
          <FlexView
            alignItems="center"
            justifyContent="center"
            padding={['3xs', '2xl', '0', '2xl']}
          >
            <Text center color="error-100" variant="paragraph-500" style={styles.errorText}>
              There was an error while connecting with {providerName}
            </Text>
            <Button
              size="sm"
              variant="accent"
              iconLeft="refresh"
              style={styles.retryButton}
              iconStyle={styles.retryIcon}
              onPress={onConnect}
            >
              Try again
            </Button>
          </FlexView>
        ) : (
          <ConnectingBody
            title={`Connecting with ${providerName}`}
            description="Please wait while we redirect you to finalize your purchase."
          />
        )}
      </FlexView>
    </ScrollView>
  );
}
