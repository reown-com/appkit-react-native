import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { Linking, ScrollView } from 'react-native';
import {
  RouterController,
  OnRampController,
  OptionsController,
  EventsController
} from '@reown/appkit-core-react-native';
import { FlexView, DoubleImageLoader, IconLink, Button, Text } from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody } from '../../partials/w3m-connecting-body';
import styles from './styles';
import { NumberUtil, StringUtil } from '@reown/appkit-common-react-native';

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
    if (EventsController.state.data.event === 'BUY_SUBMITTED') {
      // Send event only if the onramp url was already created
      EventsController.sendEvent({
        type: 'track',
        event: 'BUY_CANCEL'
      });
    }

    RouterController.goBack();
  };

  const onConnect = useCallback(async () => {
    if (OnRampController.state.selectedQuote) {
      OnRampController.clearError();
      const response = await OnRampController.generateWidget({
        quote: OnRampController.state.selectedQuote
      });
      if (response?.widgetUrl) {
        Linking.openURL(response.widgetUrl);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = Linking.addEventListener('url', ({ url }) => {
      const metadata = OptionsController.state.metadata;

      if (
        (metadata?.redirect?.universal && url.startsWith(metadata?.redirect?.universal)) ||
        (metadata?.redirect?.native && url.startsWith(metadata?.redirect?.native))
      ) {
        const parsedUrl = new URL(url);
        const searchParams = new URLSearchParams(parsedUrl.search);
        const asset =
          searchParams.get('cryptoCurrency') ??
          OnRampController.state.purchaseCurrency?.currencyCode ??
          null;
        const network =
          searchParams.get('network') ?? OnRampController.state.purchaseCurrency?.chainName ?? null;
        const purchaseAmount =
          searchParams.get('cryptoAmount') ??
          OnRampController.state.selectedQuote?.destinationAmount ??
          null;
        const amount =
          searchParams.get('fiatAmount') ?? OnRampController.state.paymentAmount ?? null;
        const currency =
          searchParams.get('fiatCurrency') ??
          OnRampController.state.paymentCurrency?.currencyCode ??
          null;
        const orderId = searchParams.get('orderId');
        const status = searchParams.get('status');

        EventsController.sendEvent({
          type: 'track',
          event: 'BUY_SUCCESS',
          properties: {
            asset,
            network,
            amount: amount?.toString(),
            currency,
            orderId
          }
        });

        RouterController.reset('OnRampTransaction', {
          onrampResult: {
            purchaseCurrency: asset,
            purchaseAmount: purchaseAmount
              ? NumberUtil.formatNumberToLocalString(purchaseAmount)
              : null,
            purchaseImageUrl: OnRampController.state.purchaseCurrency?.symbolImageUrl ?? '',
            paymentCurrency: currency,
            paymentAmount: amount ? NumberUtil.formatNumberToLocalString(amount) : null,
            network,
            status
          }
        });
      }
    });

    return () => unsubscribe.remove();
  }, []);

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  return (
    <ScrollView
      bounces={false}
      fadingEdgeLength={20}
      contentContainerStyle={styles.container}
      testID="onramp-loading-widget-view"
    >
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
