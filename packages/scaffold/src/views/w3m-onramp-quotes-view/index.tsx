import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { FlatList, Linking, View } from 'react-native';
import {
  ConnectorController,
  OnRampController,
  OptionsController,
  RouterController,
  SnackController,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { FlexView, LoadingSpinner, Spacing, Text } from '@reown/appkit-ui-react-native';
import { Quote, ITEM_HEIGHT } from './components/Quote';
import styles from './styles';

export function OnRampQuotesView() {
  const { quotes, quotesLoading } = useSnapshot(OnRampController.state);
  const [loading, setLoading] = useState(false);

  const onQuotePress = async (quote: OnRampQuote) => {
    setLoading(true);
    const response = await OnRampController.getWidget({ quote });
    if (response?.widgetUrl) {
      Linking.openURL(response?.widgetUrl);
    }
  };

  const renderSeparator = () => {
    return <View style={styles.separator} />;
  };

  const renderQuote = ({ item }: { item: OnRampQuote }) => {
    const serviceProvider = OnRampController.state.serviceProviders.find(
      sp => sp.serviceProvider === item.serviceProvider
    );

    return (
      <Quote
        item={item}
        serviceProvider={serviceProvider}
        loading={loading}
        onQuotePress={onQuotePress}
      />
    );
  };

  useEffect(() => {
    OnRampController.getQuotes();
  }, []);

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
        //TODO: Reload balance / activity
      }
    });

    return () => unsubscribe.remove();
  }, []);

  //TODO: Add better loading state
  return quotesLoading || loading ? (
    <FlexView style={styles.loadingContainer} justifyContent="center" alignItems="center">
      <LoadingSpinner />
      <Text style={{ marginTop: Spacing.m }}>Loading...</Text>
    </FlexView>
  ) : (
    <FlatList
      fadingEdgeLength={20}
      bounces={false}
      data={quotes}
      renderItem={renderQuote}
      ItemSeparatorComponent={renderSeparator}
      style={styles.listContainer}
      contentContainerStyle={styles.listContent}
      keyExtractor={(item, index) => item?.serviceProvider ?? index}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
