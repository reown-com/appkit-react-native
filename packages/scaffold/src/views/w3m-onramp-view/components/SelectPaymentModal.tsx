import { useState } from 'react';
import { useSnapshot } from 'valtio';
import Modal from 'react-native-modal';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  BorderRadius,
  FlexView,
  IconLink,
  LoadingSpinner,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import {
  OnRampController,
  ThemeController,
  type OnRampPaymentMethod,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { ITEM_HEIGHT, Quote } from './Quote';
import { SelectButton } from './SelectButton';
import { SelectorModal } from '../../../partials/w3m-selector-modal';
import { getModalItemKey, getModalItems, getModalTitle } from '../utils';
import { PaymentMethod } from './PaymentMethod';

interface SelectPaymentModalProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
}

const SEPARATOR_HEIGHT = Spacing.s;

export function SelectPaymentModal({ title, visible, onClose }: SelectPaymentModalProps) {
  const Theme = useTheme();
  const { themeMode } = useSnapshot(ThemeController.state);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [searchCountryValue, setSearchCountryValue] = useState('');
  const { selectedPaymentMethod, quotes, quotesLoading } = useSnapshot(OnRampController.state);

  const modalPaymentMethods = getModalItems(
    'paymentMethod',
    searchCountryValue
  ) as OnRampPaymentMethod[];

  const paymentLogo =
    themeMode === 'dark' ? selectedPaymentMethod?.logos.dark : selectedPaymentMethod?.logos.light;

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
    setPaymentVisible(false);
  };

  const renderQuote = ({ item }: { item: OnRampQuote }) => {
    const logoURL = OnRampController.getServiceProviderImage(item.serviceProvider);
    const selected = item.serviceProvider === OnRampController.state.selectedQuote?.serviceProvider;

    return (
      <Quote
        item={item}
        selected={selected}
        logoURL={logoURL}
        onQuotePress={() => handleQuotePress(item)}
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

    return (
      <PaymentMethod
        item={parsedItem}
        onPress={() => handlePaymentMethodPress(parsedItem)}
        selected={parsedItem.name === selectedPaymentMethod?.name}
      />
    );
  };

  return (
    <Modal
      isVisible={visible}
      useNativeDriver
      useNativeDriverForBackdrop
      onBackdropPress={onClose}
      onDismiss={onClose}
      style={styles.modal}
    >
      <FlatList
        data={quotes}
        renderItem={renderQuote}
        style={[
          styles.container,
          {
            backgroundColor: Theme['bg-200']
          }
        ]}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        keyExtractor={(item, index) => getModalItemKey('quotes', index, item)}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
          offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
          index
        })}
        ListHeaderComponent={
          <FlexView>
            <FlexView
              alignItems="center"
              justifyContent="space-between"
              flexDirection="row"
              style={styles.header}
            >
              <IconLink icon="arrowLeft" onPress={onClose} />
              {!!title && <Text variant="medium-600">{title}</Text>}
              <View style={styles.iconPlaceholder} />
            </FlexView>
            <Text variant="small-500" color="fg-150" style={styles.subtitle}>
              Pay with
            </Text>
            <SelectButton
              style={styles.paymentMethodButton}
              onPress={() => setPaymentVisible(true)}
              imageURL={paymentLogo}
              text={selectedPaymentMethod?.name}
            />
            <Text variant="small-500" color="fg-150" style={styles.subtitle}>
              Providers
            </Text>
          </FlexView>
        }
      />
      <SelectorModal
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
        items={modalPaymentMethods}
        onSearch={setSearchCountryValue}
        renderItem={renderPaymentMethod}
        title={getModalTitle('paymentMethod')}
        keyExtractor={(item: OnRampPaymentMethod, index: number) =>
          getModalItemKey('paymentMethod', index, item)
        }
      />
    </Modal>
  );
}
const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    marginBottom: Spacing.l
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  content: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  },
  subtitle: {
    marginBottom: Spacing.xs
  },
  paymentMethodButton: {
    height: 50,
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius['3xs']
  },
  emptyContainer: {
    height: 150
  }
});
