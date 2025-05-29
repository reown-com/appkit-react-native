import { useSnapshot } from 'valtio';
import { useRef, useState, useMemo, useEffect } from 'react';
import Modal from 'react-native-modal';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  FlexView,
  IconLink,
  Spacing,
  Text,
  useTheme,
  Separator,
  LoadingSpinner,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  type OnRampPaymentMethod,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { Placeholder } from '../../../partials/w3m-placeholder';
import { Quote, ITEM_HEIGHT as QUOTE_ITEM_HEIGHT } from './Quote';
import { PaymentMethod } from './PaymentMethod';

interface SelectPaymentModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectPaymentModal({ title, visible, onClose }: SelectPaymentModalProps) {
  const Theme = useTheme();
  const { selectedQuote, quotes } = useSnapshot(OnRampController.state);
  const paymentMethodsRef = useRef<FlatList>(null);
  const [paymentMethods, setPaymentMethods] = useState<OnRampPaymentMethod[]>(
    OnRampController.state.paymentMethods
  );

  const sortedQuotes = useMemo(() => {
    if (!selectedQuote) {
      return quotes;
    }

    return [
      selectedQuote,
      // eslint-disable-next-line valtio/state-snapshot-rule
      ...(quotes?.filter(quote => quote.serviceProvider !== selectedQuote.serviceProvider) ?? [])
    ];
  }, [quotes, selectedQuote]);

  const renderSeparator = () => {
    return <View style={{ height: SEPARATOR_HEIGHT }} />;
  };

  const handleQuotePress = (quote: OnRampQuote) => {
    if (quote.serviceProvider !== OnRampController.state.selectedQuote?.serviceProvider) {
      OnRampController.setSelectedQuote(quote);
    }
    onClose();
  };

  const handlePaymentMethodPress = (paymentMethod: OnRampPaymentMethod) => {
    if (
      paymentMethod.paymentMethod !== OnRampController.state.selectedPaymentMethod?.paymentMethod
    ) {
      OnRampController.setSelectedPaymentMethod(paymentMethod);
    }
  };

  const renderQuote = ({ item }: { item: OnRampQuote }) => {
    const logoURL = OnRampController.getServiceProviderImage(item.serviceProvider);
    const selected = item.serviceProvider === OnRampController.state.selectedQuote?.serviceProvider;
    const isBestDeal =
      OnRampController.state.quotes?.findIndex(
        quote => quote.serviceProvider === item.serviceProvider
      ) === 0;
    const tagText = isBestDeal ? 'Best Deal' : item.lowKyc ? 'Low KYC' : undefined;

    return (
      <Quote
        item={item}
        selected={selected}
        logoURL={logoURL}
        onQuotePress={() => handleQuotePress(item)}
        tagText={tagText}
      />
    );
  };

  const renderEmpty = () => {
    return OnRampController.state.quotesLoading ? (
      <FlexView
        alignItems="center"
        justifyContent="center"
        padding="2xl"
        style={styles.emptyContainer}
      >
        <LoadingSpinner />
      </FlexView>
    ) : (
      <Placeholder
        title="No providers available"
        description="Please select a different payment method or increase the amount"
        icon="warningCircle"
      />
    );
  };

  const renderPaymentMethod = ({ item }: { item: OnRampPaymentMethod }) => {
    const parsedItem = item as OnRampPaymentMethod;
    const selected =
      parsedItem.paymentMethod === OnRampController.state.selectedPaymentMethod?.paymentMethod;

    return (
      <PaymentMethod
        item={parsedItem}
        onPress={() => handlePaymentMethodPress(parsedItem)}
        selected={selected}
        testID={`payment-method-item-${parsedItem.paymentMethod}`}
      />
    );
  };

  useEffect(() => {
    if (visible) {
      //Update payment methods order
      setPaymentMethods(OnRampController.state.paymentMethods);
    }
  }, [visible]);

  return (
    <Modal
      isVisible={visible}
      useNativeDriver
      useNativeDriverForBackdrop
      statusBarTranslucent
      hideModalContentWhileAnimating
      onBackdropPress={onClose}
      onDismiss={onClose}
      style={styles.modal}
    >
      <FlexView style={[styles.container, { backgroundColor: Theme['bg-100'] }]}>
        <FlexView
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          style={styles.header}
        >
          <IconLink icon="arrowLeft" onPress={onClose} testID="payment-modal-button-back" />
          {!!title && <Text variant="paragraph-600">{title}</Text>}
          <View style={styles.iconPlaceholder} />
        </FlexView>
        <Text variant="small-500" color="fg-150" style={styles.subtitle}>
          Pay with
        </Text>
        <FlexView>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            ref={paymentMethodsRef}
            style={styles.paymentMethodsContainer}
            contentContainerStyle={styles.paymentMethodsContent}
            fadingEdgeLength={20}
            keyExtractor={item => item.paymentMethod}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </FlexView>
        <Separator style={styles.separator} color="gray-glass-010" />
        <Text variant="small-500" color="fg-150" style={styles.subtitle}>
          Providers
        </Text>
        <FlatList
          data={sortedQuotes}
          bounces={false}
          renderItem={renderQuote}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          fadingEdgeLength={20}
          ListEmptyComponent={renderEmpty}
          keyExtractor={item => `${item.serviceProvider}-${item.paymentMethodType}`}
          getItemLayout={(_, index) => ({
            length: QUOTE_ITEM_HEIGHT + SEPARATOR_HEIGHT,
            offset: (QUOTE_ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
            index
          })}
        />
      </FlexView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    marginBottom: Spacing.l,
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.m
  },
  container: {
    height: '80%',
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l
  },
  separator: {
    width: undefined,
    marginVertical: Spacing.m,
    marginHorizontal: Spacing.m
  },
  listContent: {
    paddingTop: Spacing['3xs'],
    paddingBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.m
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  },
  subtitle: {
    marginBottom: Spacing.xs,
    marginHorizontal: Spacing.m
  },
  emptyContainer: {
    height: 150
  },
  paymentMethodsContainer: {
    paddingHorizontal: Spacing['3xs']
  },
  paymentMethodsContent: {
    paddingLeft: Spacing.xs
  }
});
