import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  OnRampController,
  type OnRampCountry,
  type OnRampFiatCurrency,
  type OnRampCryptoCurrency,
  ThemeController,
  RouterController
} from '@reown/appkit-core-react-native';
import { BorderRadius, Button, FlexView, Spacing } from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';
import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Country } from './components/Country';
import { Currency } from './components/Currency';
import { getErrorMessage, getModalItems, getModalTitle, onModalItemPress } from './utils';
import { SelectButton } from './components/SelectButton';
import { InputToken } from './components/InputToken';
import { SelectPaymentModal } from './components/SelectPaymentModal';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';

export function OnRampView() {
  const { themeMode } = useSnapshot(ThemeController.state);

  //TODO: add loading state for countries, payment methods, etc
  const {
    purchaseCurrency,
    selectedCountry,
    paymentCurrency,
    selectedPaymentMethod,
    paymentAmount,
    quotesLoading,
    selectedQuote,
    error
  } = useSnapshot(OnRampController.state);
  const [searchValue, setSearchValue] = useState('');
  const [modalType, setModalType] = useState<
    'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | undefined
  >();

  const debouncedGetQuotes = useDebounceCallback({
    callback: OnRampController.getQuotes,
    delay: 500
  });

  const onInputChange = (value: string) => {
    const formattedValue = value.replace(/,/g, '.');

    if (Number(formattedValue) >= 0 || formattedValue === '') {
      OnRampController.setPaymentAmount(Number(formattedValue));
      OnRampController.clearError();
      debouncedGetQuotes();
    }

    if (formattedValue === '') {
      OnRampController.setSelectedQuote(undefined);
    }
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
        <Country
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.countryCode === selectedCountry?.countryCode}
        />
      );
    }

    if (modalType === 'paymentCurrency') {
      const parsedItem = item as OnRampFiatCurrency;

      return (
        <Currency
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
        <Currency
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.currencyCode === purchaseCurrency?.currencyCode}
          isToken={true}
        />
      );
    }

    return <View />;
  };

  const onPressModalItem = (item: any) => {
    onModalItemPress(item, modalType);
    setModalType(undefined);
    setSearchValue('');
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
    if (
      purchaseCurrency &&
      selectedCountry &&
      paymentCurrency &&
      selectedPaymentMethod &&
      OnRampController.state.paymentAmount
    ) {
      OnRampController.getQuotes();
    }
  }, [purchaseCurrency, selectedCountry, paymentCurrency, selectedPaymentMethod]);

  return (
    <FlexView padding={['s', 's', '4xl', 's']}>
      <SelectButton
        style={styles.countryButton}
        onPress={() => setModalType('country')}
        imageURL={selectedCountry?.flagImageUrl}
        imageStyle={styles.flagImage}
        isSVG
      />
      <InputToken
        title="You pay"
        onInputChange={onInputChange}
        value={paymentAmount?.toString()}
        tokenImage={paymentCurrency?.symbolImageUrl}
        tokenSymbol={paymentCurrency?.currencyCode}
        onTokenPress={() => setModalType('paymentCurrency')}
        style={{ marginBottom: Spacing.s }}
        error={getErrorMessage(error)}
      />
      <InputToken
        title="You receive"
        value={NumberUtil.roundNumber(selectedQuote?.destinationAmount ?? 0, 6, 5)?.toString()}
        editable={false}
        tokenImage={purchaseCurrency?.symbolImageUrl}
        tokenSymbol={purchaseCurrency?.currencyCode}
        onTokenPress={() => setModalType('purchaseCurrency')}
        loading={quotesLoading}
        containerHeight={80}
      />
      <SelectButton
        style={styles.paymentMethodButton}
        onPress={() => setModalType('paymentMethod')}
        imageURL={selectedPaymentMethod?.logos[themeMode ?? 'light']}
        text={selectedPaymentMethod?.name}
        description={selectedQuote ? `via ${selectedQuote?.serviceProvider}` : 'Select a provider'}
        isError={!selectedQuote}
        loading={quotesLoading}
        loadingHeight={60}
      />
      <Button
        style={styles.quotesButton}
        onPress={handleContinue}
        loading={quotesLoading}
        disabled={quotesLoading || !selectedQuote}
      >
        Continue
      </Button>
      <SelectorModal
        visible={!!modalType && modalType !== 'paymentMethod'}
        onClose={onModalClose}
        items={getModalItems(modalType, searchValue)}
        onSearch={handleSearch}
        renderItem={renderModalItem}
        title={getModalTitle(modalType)}
      />
      <SelectPaymentModal
        visible={modalType === 'paymentMethod'}
        onClose={onModalClose}
        title="Payment"
      />
    </FlexView>
  );
}

export const styles = StyleSheet.create({
  input: {
    fontSize: 20,
    flex: 1,
    marginRight: Spacing.xs
  },
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius['3xs']
  },
  quotesButton: {
    marginTop: Spacing.m
  },
  countryButton: {
    width: 60,
    alignSelf: 'flex-end',
    marginBottom: Spacing.s
  },
  flagImage: {
    height: 16
  },
  paymentMethodButton: {
    width: '100%',
    height: 60,
    justifyContent: 'space-between',
    marginTop: Spacing.s
  },
  purchaseCurrencyButton: {
    height: 50,
    width: 110
  },
  purchaseCurrencyImage: {
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth
  },
  providerButton: {
    marginTop: Spacing.s,
    height: 60,
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: Spacing.l
  },
  providerImage: {
    height: 20,
    width: 20,
    borderRadius: BorderRadius.full
  }
});
