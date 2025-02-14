import { useSnapshot } from 'valtio';
import Modal from 'react-native-modal';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  FlexView,
  IconLink,
  LoadingSpinner,
  Spacing,
  Text,
  useTheme,
  ExpandableList,
  type ExpandableListRef,
  Separator
} from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  type OnRampPaymentMethod,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { Quote } from './Quote';
import { PaymentMethod, ITEM_SIZE } from './PaymentMethod';
import { ToggleButton } from './ToggleButton';
import { useRef, useState } from 'react';

interface SelectPaymentModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectPaymentModal({ title, visible, onClose }: SelectPaymentModalProps) {
  const Theme = useTheme();
  const { quotes, quotesLoading } = useSnapshot(OnRampController.state);
  const expandableListRef = useRef<ExpandableListRef>(null);
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

  const handleToggle = () => {
    expandableListRef.current?.toggle();
  };

  const handlePaymentMethodPress = (paymentMethod: OnRampPaymentMethod) => {
    if (
      paymentMethod.paymentMethod !== OnRampController.state.selectedPaymentMethod?.paymentMethod
    ) {
      OnRampController.setSelectedPaymentMethod(paymentMethod);
    }
    expandableListRef.current?.toggle(false);

    const itemsPerRow = expandableListRef.current?.getItemsPerRow() ?? 4;

    // Switch payment method to the top if there are more than itemsPerRow payment methods
    if (OnRampController.state.paymentMethods.length > itemsPerRow) {
      const paymentIndex = paymentMethods.findIndex(method => method.name === paymentMethod.name);

      // Switch payment if its not vivis
      if (paymentIndex + 1 > itemsPerRow - 1) {
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

  const renderPaymentMethod = (item: OnRampPaymentMethod) => {
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
        <FlexView style={styles.topContent}>
          <Text variant="small-500" color="fg-150" style={styles.subtitle}>
            Pay with
          </Text>
          <ExpandableList
            items={paymentMethods}
            renderItem={renderPaymentMethod}
            style={styles.paymentMethodList}
            containerPadding={Spacing.m}
            itemWidth={ITEM_SIZE}
            ref={expandableListRef}
            renderToggle={isExpanded => (
              <ToggleButton onPress={handleToggle} isExpanded={isExpanded} />
            )}
          />
          <Separator style={styles.separator} color="gray-glass-020" />
          <Text variant="small-500" color="fg-150" style={styles.subtitle}>
            Providers
          </Text>
        </FlexView>
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
            length: ITEM_SIZE + SEPARATOR_HEIGHT,
            offset: (ITEM_SIZE + SEPARATOR_HEIGHT) * index,
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
  topContent: {
    paddingHorizontal: Spacing.m
  },
  separator: {
    marginVertical: Spacing.m
  },
  listContent: {
    paddingBottom: Spacing['4xl'],
    paddingHorizontal: Spacing.m
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  },
  subtitle: {
    marginBottom: Spacing.xs
  },
  emptyContainer: {
    height: 150
  },
  paymentMethodList: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
