import { useSnapshot } from 'valtio';
import { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  OnRampController,
  type OnRampCryptoCurrency,
  ThemeController,
  RouterController,
  type OnRampControllerState
} from '@reown/appkit-core-react-native';
import {
  BorderRadius,
  Button,
  FlexView,
  ListItem,
  Spacing,
  Text,
  TokenButton,
  useTheme
} from '@reown/appkit-ui-react-native';
import { NumberUtil, StringUtil } from '@reown/appkit-common-react-native';
import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Currency } from './components/Currency';
import {
  getErrorMessage,
  getModalItemKey,
  getModalItems,
  getModalTitle,
  getItemHeight
} from './utils';

import { CurrencyInput } from './components/CurrencyInput';
import { SelectPaymentModal } from './components/SelectPaymentModal';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { Header } from './components/Header';

const MemoizedCurrency = memo(Currency);

export function OnRampView() {
  const { themeMode } = useSnapshot(ThemeController.state);
  const Theme = useTheme();

  const {
    purchaseCurrency,
    paymentCurrency,
    paymentMethods,
    selectedPaymentMethod,
    paymentAmount,
    quotesLoading,
    selectedQuote,
    error,
    loading
  } = useSnapshot(OnRampController.state) as OnRampControllerState;
  const [searchValue, setSearchValue] = useState('');
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isPaymentMethodModalVisible, setIsPaymentMethodModalVisible] = useState(false);

  const getQuotes = useCallback(() => {
    if (
      OnRampController.state.purchaseCurrency &&
      OnRampController.state.selectedCountry &&
      OnRampController.state.paymentCurrency &&
      OnRampController.state.selectedPaymentMethod &&
      OnRampController.state.paymentAmount &&
      OnRampController.state.paymentAmount > 0 &&
      !OnRampController.state.loading
    ) {
      OnRampController.getQuotes();
    }
  }, []);

  const { debouncedCallback: debouncedGetQuotes } = useDebounceCallback({
    callback: getQuotes,
    delay: 500
  });

  const onValueChange = (value: number) => {
    if (!value) {
      OnRampController.abortGetQuotes();
      OnRampController.setPaymentAmount(0);
      OnRampController.setSelectedQuote(undefined);
      OnRampController.clearError();

      return;
    }

    OnRampController.setPaymentAmount(value);
    debouncedGetQuotes();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleContinue = async () => {
    if (OnRampController.state.selectedQuote) {
      RouterController.push('OnRampLoading');
    }
  };

  const renderCurrencyItem = ({ item }: { item: OnRampCryptoCurrency }) => {
    return (
      <MemoizedCurrency
        item={item}
        onPress={onPressPurchaseCurrency}
        selected={item.currencyCode === purchaseCurrency?.currencyCode}
        isToken={true}
      />
    );
  };

  const onPressPurchaseCurrency = async (item: any) => {
    setIsCurrencyModalVisible(false);
    setIsPaymentMethodModalVisible(false);
    setSearchValue('');
    OnRampController.setPurchaseCurrency(item as OnRampCryptoCurrency);
    getQuotes();
  };

  const onModalClose = () => {
    setSearchValue('');
    setIsCurrencyModalVisible(false);
    setIsPaymentMethodModalVisible(false);
  };

  useEffect(() => {
    // update selected purchase currency based on active network
    OnRampController.updateSelectedPurchaseCurrency();
  }, []);

  useEffect(() => {
    getQuotes();
  }, [selectedPaymentMethod, getQuotes]);

  return (
    <>
      <Header onSettingsPress={() => RouterController.push('OnRampSettings')} />
      <ScrollView bounces={false}>
        <FlexView padding={['s', 'l', '4xl', 'l']}>
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="small-400" color="fg-150">
              You Buy
            </Text>
            <TokenButton
              placeholder={'Select currency'}
              imageUrl={purchaseCurrency?.symbolImageUrl}
              text={purchaseCurrency?.currencyCode}
              onPress={() => setIsCurrencyModalVisible(true)}
            />
          </FlexView>
          <CurrencyInput
            value={paymentAmount?.toString()}
            symbol={paymentCurrency?.currencyCode}
            error={getErrorMessage(error)}
            loading={loading || quotesLoading}
            purchaseValue={`${
              selectedQuote?.destinationAmount
                ? NumberUtil.roundNumber(selectedQuote.destinationAmount, 6, 5)?.toString()
                : '0.00'
            }${purchaseCurrency?.currencyCode ?? ''}`}
            onValueChange={onValueChange}
          />
          <ListItem
            chevron
            backgroundColor="gray-glass-005"
            loading={quotesLoading || loading}
            onPress={() => setIsPaymentMethodModalVisible(true)}
            style={styles.paymentMethodButton}
            imageSrc={selectedPaymentMethod?.logos[themeMode ?? 'light']}
            imageStyle={styles.paymentMethodImage}
            imageContainerStyle={[
              styles.paymentMethodImageContainer,
              { backgroundColor: Theme['gray-glass-010'] }
            ]}
          >
            <FlexView>
              <Text variant="paragraph-400" color="fg-100">
                {selectedPaymentMethod?.name}
              </Text>
              <Text variant="small-400" color="fg-150">
                {selectedQuote
                  ? `via ${StringUtil.capitalize(selectedQuote?.serviceProvider)}`
                  : !paymentMethods?.length
                  ? 'No payment methods available'
                  : 'Select a provider'}
              </Text>
            </FlexView>
          </ListItem>
          <FlexView
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            margin={['m', '0', '0', '0']}
          >
            <Button variant="shade" style={styles.cancelButton}>
              Cancel
            </Button>
            <Button
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={quotesLoading || loading || !selectedQuote}
            >
              Continue
            </Button>
          </FlexView>
          <SelectPaymentModal
            visible={isPaymentMethodModalVisible}
            onClose={onModalClose}
            title="Payment"
          />
          <SelectorModal
            selectedItem={purchaseCurrency}
            visible={isCurrencyModalVisible}
            onClose={onModalClose}
            items={getModalItems('purchaseCurrency', searchValue, true)}
            onSearch={handleSearch}
            renderItem={renderCurrencyItem}
            keyExtractor={(item: any, index: number) =>
              getModalItemKey('purchaseCurrency', index, item)
            }
            title={getModalTitle('purchaseCurrency')}
            itemHeight={getItemHeight('purchaseCurrency')}
          />
        </FlexView>
      </ScrollView>
    </>
  );
}

export const styles = StyleSheet.create({
  continueButton: {
    marginLeft: Spacing.m,
    flex: 3
  },
  cancelButton: {
    flex: 1
  },
  paymentMethodButton: {
    borderRadius: BorderRadius.s,
    height: 64
  },
  paymentMethodImage: {
    width: 20,
    height: 20,
    borderRadius: 0
  },
  paymentMethodImageContainer: {
    width: 40,
    height: 40,
    borderWidth: 0,
    borderRadius: BorderRadius['3xs']
  }
});
