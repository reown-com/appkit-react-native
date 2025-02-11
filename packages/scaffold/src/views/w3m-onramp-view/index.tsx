import { useSnapshot } from 'valtio';
import { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  OnRampController,
  type OnRampCountry,
  type OnRampFiatCurrency,
  type OnRampCryptoCurrency,
  ThemeController,
  RouterController,
  type OnRampControllerState
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  Separator,
  Spacing,
  Text,
  TokenButton
} from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';
import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Country } from './components/Country';
import { Currency } from './components/Currency';
import {
  getErrorMessage,
  getModalItemKey,
  getModalItems,
  getModalTitle,
  onModalItemPress,
  getItemHeight,
  type ModalType
} from './utils';
import { SelectButton } from './components/SelectButton';
import { CurrencyInput } from './components/CurrencyInput';
import { SelectPaymentModal } from './components/SelectPaymentModal';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { Header } from './components/Header';

const MemoizedCountry = memo(Country);
const MemoizedCurrency = memo(Currency);

export function OnRampView() {
  const { themeMode } = useSnapshot(ThemeController.state);

  const {
    purchaseCurrency,
    selectedCountry,
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
  const [modalType, setModalType] = useState<ModalType>();

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

  const { debouncedCallback: debouncedGetQuotes, abort: abortGetQuotes } = useDebounceCallback({
    callback: getQuotes,
    delay: 500
  });

  const onValueChange = (value: number) => {
    if (!value) {
      abortGetQuotes();
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

  const renderModalItem = ({ item }: { item: any }) => {
    if (modalType === 'country') {
      const parsedItem = item as OnRampCountry;

      return (
        <MemoizedCountry
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.countryCode === selectedCountry?.countryCode}
        />
      );
    }

    if (modalType === 'paymentCurrency') {
      const parsedItem = item as OnRampFiatCurrency;

      return (
        <MemoizedCurrency
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.currencyCode === paymentCurrency?.currencyCode}
          isToken={false}
        />
      );
    }

    if (modalType === 'purchaseCurrency') {
      const parsedItem = item as OnRampCryptoCurrency;

      return (
        <MemoizedCurrency
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.currencyCode === purchaseCurrency?.currencyCode}
          isToken={true}
        />
      );
    }

    return <View />;
  };

  const onPressModalItem = async (item: any) => {
    setModalType(undefined);
    setSearchValue('');
    await onModalItemPress(item, modalType);
    getQuotes();
  };

  const onModalClose = () => {
    setModalType(undefined);
    setSearchValue('');
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
      <Header selectedCountry={selectedCountry} onCountryPress={() => setModalType('country')} />
      <ScrollView bounces={false}>
        <FlexView padding={['s', 's', '4xl', 's']}>
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="small-400" color="fg-150">
              Pay in
            </Text>
            <TokenButton
              placeholder={'Select currency'}
              imageUrl={paymentCurrency?.symbolImageUrl}
              text={paymentCurrency?.currencyCode}
              onPress={() => setModalType('paymentCurrency')}
            />
          </FlexView>
          <Separator color="bg-200" style={styles.separator} />
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="small-400" color="fg-150">
              You buy
            </Text>
            <TokenButton
              placeholder={'Select currency'}
              imageUrl={purchaseCurrency?.symbolImageUrl}
              text={purchaseCurrency?.currencyCode}
              onPress={() => setModalType('purchaseCurrency')}
            />
          </FlexView>
          <CurrencyInput
            value={paymentAmount?.toString()}
            error={getErrorMessage(error)}
            loading={loading || quotesLoading}
            purchaseValue={`≈ ${
              selectedQuote?.destinationAmount
                ? NumberUtil.roundNumber(selectedQuote.destinationAmount, 6, 5)?.toString()
                : '0.00'
            } ${purchaseCurrency?.currencyCode}`}
            onValueChange={onValueChange}
          />
          <SelectButton
            style={styles.paymentMethodButton}
            onPress={() => setModalType('paymentMethod')}
            imageURL={selectedPaymentMethod?.logos[themeMode ?? 'light']}
            text={selectedPaymentMethod?.name}
            description={
              selectedQuote
                ? `via ${selectedQuote?.serviceProvider}`
                : !paymentMethods?.length
                ? 'No payment methods available'
                : 'Select a provider'
            }
            isError={!selectedQuote || !paymentMethods?.length}
            loading={quotesLoading || loading}
            loadingHeight={60}
            pressable={paymentMethods?.length > 0}
          />
          <Button
            style={styles.quotesButton}
            onPress={handleContinue}
            disabled={quotesLoading || loading || !selectedQuote}
          >
            Continue
          </Button>
          <SelectorModal
            visible={!!modalType && modalType !== 'paymentMethod'}
            onClose={onModalClose}
            items={getModalItems(modalType as Exclude<ModalType, 'quotes'>, searchValue)}
            onSearch={handleSearch}
            renderItem={renderModalItem}
            keyExtractor={(item: any, index: number) => getModalItemKey(modalType, index, item)}
            title={getModalTitle(modalType)}
            itemHeight={getItemHeight(modalType)}
          />
          <SelectPaymentModal
            visible={modalType === 'paymentMethod'}
            onClose={onModalClose}
            title="Payment"
          />
        </FlexView>
      </ScrollView>
    </>
  );
}

export const styles = StyleSheet.create({
  quotesButton: {
    marginTop: Spacing.m
  },
  paymentMethodButton: {
    width: '100%',
    height: 60,
    justifyContent: 'space-between',
    marginTop: Spacing.s
  },
  separator: {
    marginVertical: Spacing['2xs']
  }
});
