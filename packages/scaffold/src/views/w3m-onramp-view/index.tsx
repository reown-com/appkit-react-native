import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  OnRampController,
  type OnRampCountry,
  type OnRampPaymentMethod,
  type OnRampFiatCurrency,
  type OnRampCryptoCurrency,
  ThemeController
} from '@reown/appkit-core-react-native';
import { BorderRadius, Button, FlexView, Spacing } from '@reown/appkit-ui-react-native';
import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Country } from './components/Country';
import { Currency } from './components/Currency';
import { PaymentMethod } from './components/PaymentMethod';
import { getModalItems, getModalTitle } from './utils';
import { SelectButton } from './components/SelectButton';
import { InputToken } from './components/InputToken';
import { SelectPaymentModal } from './components/SelectPaymentModal';

export function OnRampView() {
  const { themeMode } = useSnapshot(ThemeController.state);
  const {
    purchaseCurrency,
    selectedCountry,
    paymentCurrency,
    selectedPaymentMethod,
    paymentAmount,
    quotesLoading,
    selectedQuote,
    selectedServiceProvider
  } = useSnapshot(OnRampController.state);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<
    'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quotes' | undefined
  >();

  const paymentLogo =
    themeMode === 'dark' ? selectedPaymentMethod?.logos.light : selectedPaymentMethod?.logos.dark;

  const onInputChange = (value: string) => {
    const formattedValue = value.replace(/,/g, '.');

    if (Number(formattedValue) >= 0 || formattedValue === '') {
      // setInputValue(formattedValue);
      OnRampController.setPaymentAmount(Number(formattedValue));
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    const response = await OnRampController.getWidget({
      quote: OnRampController.state.selectedQuote
    });
    if (response?.widgetUrl) {
      Linking.openURL(response?.widgetUrl);
    }
    // GO TO LOADING SCREEN
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
    if (modalType === 'paymentMethod') {
      const parsedItem = item as OnRampPaymentMethod;

      return (
        <PaymentMethod
          item={parsedItem}
          onPress={onPressModalItem}
          selected={parsedItem.name === selectedPaymentMethod?.name}
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
    if (modalType === 'country') {
      OnRampController.setSelectedCountry(item as OnRampCountry);
    }
    if (modalType === 'paymentMethod') {
      OnRampController.setSelectedPaymentMethod(item as OnRampPaymentMethod);
    }
    if (modalType === 'paymentCurrency') {
      OnRampController.setPaymentCurrency(item as OnRampFiatCurrency);
    }
    if (modalType === 'purchaseCurrency') {
      OnRampController.setPurchaseCurrency(item as OnRampCryptoCurrency);
    }

    setModalType(undefined);
  };

  const onModalClose = () => {
    setModalType(undefined);
  };

  useEffect(() => {
    OnRampController.getAvailableCryptoCurrencies();
  }, []);

  useEffect(() => {
    if (
      purchaseCurrency &&
      selectedCountry &&
      paymentCurrency &&
      selectedPaymentMethod &&
      paymentAmount
    ) {
      OnRampController.getQuotes();
    }
  }, [purchaseCurrency, selectedCountry, paymentCurrency, selectedPaymentMethod, paymentAmount]);

  return (
    <FlexView padding={['s', 's', '2xl', 's']}>
      <SelectButton
        style={styles.countryButton}
        onPress={() => setModalType('country')}
        imageURL={selectedCountry?.flagImageUrl}
        imageStyle={styles.flagImage}
        isSVG
      />
      <InputToken
        title="You pay"
        initialValue={paymentAmount?.toString()}
        onInputChange={onInputChange}
        tokenImage={paymentCurrency?.symbolImageUrl}
        tokenSymbol={paymentCurrency?.currencyCode}
        onTokenPress={() => setModalType('paymentCurrency')}
        style={{ marginBottom: Spacing.s }}
      />
      <InputToken
        title="You receive"
        value={selectedQuote?.destinationAmount?.toString()}
        editable={false}
        tokenImage={purchaseCurrency?.symbolImageUrl}
        tokenSymbol={purchaseCurrency?.currencyCode}
        onTokenPress={() => setModalType('purchaseCurrency')}
        loading={quotesLoading}
      />
      <SelectButton
        style={styles.paymentMethodButton}
        onPress={() => setModalType('paymentMethod')}
        imageURL={paymentLogo}
        text={selectedPaymentMethod?.name}
        description={selectedQuote ? `via ${selectedQuote?.serviceProvider}` : 'Select a provider'}
        isError={!selectedQuote}
        loading={quotesLoading}
        loadingHeight={60}
      />
      <Button
        style={styles.quotesButton}
        onPress={handleContinue}
        loading={quotesLoading || loading}
        disabled={quotesLoading || loading || !selectedQuote}
      >
        Continue
      </Button>
      <SelectorModal
        visible={!!modalType && modalType !== 'paymentMethod'}
        onClose={onModalClose}
        items={getModalItems(modalType)}
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
