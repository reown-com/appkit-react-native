import { useSnapshot } from 'valtio';
import { useRef, useState } from 'react';
import Modal from 'react-native-modal';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import {
  FlexView,
  IconLink,
  LoadingSpinner,
  Spacing,
  Text,
  useTheme,
  Separator
} from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  type OnRampPaymentMethod,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { Quote, ITEM_HEIGHT as QUOTE_ITEM_HEIGHT } from './Quote';
import { PaymentMethod, ITEM_SIZE } from './PaymentMethod';

interface SelectPaymentModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectPaymentModal({ title, visible, onClose }: SelectPaymentModalProps) {
  const Theme = useTheme();
  const { quotes, quotesLoading } = useSnapshot(OnRampController.state);
  const paymentMethodsRef = useRef<FlatList>(null);
  const [paymentMethods, setPaymentMethods] = useState<OnRampPaymentMethod[]>(
    OnRampController.state.paymentMethods
  );

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

    const visibleItemsCount = Math.round(Dimensions.get('window').width / ITEM_SIZE);

    // Switch payment method to the top if there are more than visibleItemsCount payment methods
    if (OnRampController.state.paymentMethods.length > visibleItemsCount) {
      const paymentIndex = paymentMethods.findIndex(method => method.name === paymentMethod.name);

      // Switch payment if its not visible
      if (paymentIndex + 1 > visibleItemsCount - 1) {
        const realIndex = OnRampController.state.paymentMethods.findIndex(
          method => method.name === paymentMethod.name
        );

        const newPaymentMethods = [
          paymentMethod,
          ...OnRampController.state.paymentMethods.slice(0, realIndex),
          ...OnRampController.state.paymentMethods.slice(realIndex + 1)
        ];
        setPaymentMethods(newPaymentMethods);
      }
    }
    paymentMethodsRef.current?.scrollToIndex({
      index: 0,
      animated: true
    });
  };

  const renderQuote = ({ item, index }: { item: OnRampQuote; index: number }) => {
    const logoURL = OnRampController.getServiceProviderImage(item.serviceProvider);
    const selected = item.serviceProvider === OnRampController.state.selectedQuote?.serviceProvider;

    return (
      <Quote
        item={item}
        selected={selected}
        logoURL={logoURL}
        onQuotePress={() => handleQuotePress(item)}
        isBestDeal={index === 0}
      />
    );
  };

  const renderEmpty = () => {
    return (
      <FlexView
        alignItems="center"
        justifyContent="center"
        padding="xl"
        style={styles.emptyContainer}
      >
        {quotesLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Text variant="paragraph-500">No providers available</Text>
            <Text center variant="small-500" color="fg-150">
              Please select a different payment method or increase the amount
            </Text>
          </>
        )}
      </FlexView>
    );
  };

  const renderPaymentMethod = ({ item }: { item: OnRampPaymentMethod }) => {
    const parsedItem = item as OnRampPaymentMethod;
    const selected = parsedItem.name === OnRampController.state.selectedPaymentMethod?.name;

    return (
      <PaymentMethod
        item={parsedItem}
        onPress={() => handlePaymentMethodPress(parsedItem)}
        selected={selected}
      />
    );
  };

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
          <IconLink icon="arrowLeft" onPress={onClose} />
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
            fadingEdgeLength={20}
            keyExtractor={item => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </FlexView>
        <Separator style={styles.separator} color="gray-glass-020" />
        <Text variant="small-500" color="fg-150" style={styles.subtitle}>
          Providers
        </Text>
        <FlatList
          data={quotes}
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
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
  }
});
