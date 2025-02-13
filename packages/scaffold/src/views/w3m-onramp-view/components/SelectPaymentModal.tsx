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
  Separator
} from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  type OnRampPaymentMethod,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { Quote } from './Quote';
import { getModalItemKey, getModalItems } from '../utils';
import { PaymentMethod, ITEM_SIZE } from './PaymentMethod';
import { ToggleButton } from './ToggleButton';

interface SelectPaymentModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectPaymentModal({ title, visible, onClose }: SelectPaymentModalProps) {
  const Theme = useTheme();
  const { quotes, quotesLoading } = useSnapshot(OnRampController.state);

  const modalPaymentMethods = getModalItems('paymentMethod') as OnRampPaymentMethod[];

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
            items={modalPaymentMethods}
            renderItem={renderPaymentMethod}
            style={styles.paymentMethodList}
            containerPadding={Spacing.l}
            itemWidth={ITEM_SIZE}
            renderToggle={(isExpanded, onPress) => (
              <ToggleButton onPress={onPress} isExpanded={isExpanded} />
            )}
          />
          <Separator style={styles.separator} color="bg-200" />
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
          ListEmptyComponent={renderEmpty}
          keyExtractor={(item, index) => getModalItemKey('quotes', index, item)}
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
    paddingBottom: Spacing.s,
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
