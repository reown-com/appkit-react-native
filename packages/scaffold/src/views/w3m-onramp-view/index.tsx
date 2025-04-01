import { useSnapshot } from 'valtio';
import { memo, useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  OnRampController,
  type OnRampCryptoCurrency,
  ThemeController,
  RouterController,
  type OnRampControllerState,
  NetworkController,
  AssetUtil,
  SnackController,
  ConstantsUtil
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  Image,
  ListItem,
  Text,
  TokenButton,
  useTheme
} from '@reown/appkit-ui-react-native';
import { NumberUtil, StringUtil } from '@reown/appkit-common-react-native';
import { SelectorModal } from '../../partials/w3m-selector-modal';
import { Currency } from './components/Currency';
import { getPurchaseCurrencies, getCurrencySuggestedValues } from './utils';
import { CurrencyInput } from './components/CurrencyInput';
import { SelectPaymentModal } from './components/SelectPaymentModal';
import { ITEM_HEIGHT as CURRENCY_ITEM_HEIGHT } from './components/Currency';
import { Header } from './components/Header';
import { UiUtil } from '../../utils/UiUtil';
import { LoadingView } from './components/LoadingView';
import styles from './styles';

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
    loading,
    initialLoading
  } = useSnapshot(OnRampController.state) as OnRampControllerState;
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const [searchValue, setSearchValue] = useState('');
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isPaymentMethodModalVisible, setIsPaymentMethodModalVisible] = useState(false);
  const providerImage = OnRampController.getServiceProviderImage(selectedQuote?.serviceProvider);
  const suggestedValues = getCurrencySuggestedValues(paymentCurrency);
  const purchaseCurrencyCode =
    purchaseCurrency?.currencyCode?.split('_')[0] ?? purchaseCurrency?.currencyCode;
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const getQuotes = useCallback(() => {
    if (OnRampController.canGenerateQuote()) {
      OnRampController.getQuotes();
    }
  }, []);

  const getProviderButtonText = () => {
    if (selectedQuote) {
      return 'via ';
    }

    if (!paymentAmount) {
      return 'Enter an amount';
    }

    if (!paymentMethods?.length) {
      return 'No payment methods available';
    }

    return 'Select a provider';
  };

  const onValueChange = (value: number) => {
    UiUtil.animateChange();
    if (!value) {
      OnRampController.abortGetQuotes();
      OnRampController.setPaymentAmount(0);
      OnRampController.setSelectedQuote(undefined);
      OnRampController.clearError();

      return;
    }

    OnRampController.setPaymentAmount(value);
    OnRampController.getQuotesDebounced();
  };

  const onSuggestedValuePress = (value: number) => {
    UiUtil.animateChange();
    OnRampController.setPaymentAmount(value);
    getQuotes();
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleContinue = async () => {
    if (OnRampController.state.selectedQuote) {
      RouterController.push('OnRampCheckout');
    }
  };

  const renderCurrencyItem = ({ item }: { item: OnRampCryptoCurrency }) => {
    return (
      <MemoizedCurrency
        item={item}
        onPress={onPressPurchaseCurrency}
        selected={item.currencyCode === purchaseCurrency?.currencyCode}
        title={item.name}
        subtitle={item.currencyCode.split('_')[0] ?? item.currencyCode}
        testID={`currency-item-${item.currencyCode}`}
      />
    );
  };

  const onPressPurchaseCurrency = (item: any) => {
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
    getQuotes();
  }, [selectedPaymentMethod, getQuotes]);

  useEffect(() => {
    if (error?.type === ConstantsUtil.ONRAMP_ERROR_TYPES.FAILED_TO_LOAD) {
      SnackController.showInternalError({
        shortMessage: 'Failed to load data. Please try again later.',
        longMessage: error?.message
      });
      RouterController.goBack();
    }
  }, [error]);

  useEffect(() => {
    if (OnRampController.state.countries.length === 0) {
      OnRampController.loadOnRampData();
    }
  }, []);

  if (initialLoading || OnRampController.state.countries.length === 0) {
    return <LoadingView />;
  }

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
              text={purchaseCurrencyCode}
              onPress={() => setIsCurrencyModalVisible(true)}
              testID="currency-selector"
              chevron
              renderClip={
                networkImage ? (
                  <Image
                    source={networkImage}
                    style={[styles.networkImage, { borderColor: Theme['bg-300'] }]}
                  />
                ) : null
              }
            />
          </FlexView>
          <CurrencyInput
            value={paymentAmount?.toString()}
            symbol={paymentCurrency?.currencyCode}
            error={error?.message}
            suggestedValues={suggestedValues}
            onSuggestedValuePress={onSuggestedValuePress}
            isAmountError={
              error?.type === ConstantsUtil.ONRAMP_ERROR_TYPES.AMOUNT_TOO_LOW ||
              error?.type === ConstantsUtil.ONRAMP_ERROR_TYPES.AMOUNT_TOO_HIGH ||
              error?.type === ConstantsUtil.ONRAMP_ERROR_TYPES.INVALID_AMOUNT
            }
            loading={loading || quotesLoading}
            purchaseValue={`${selectedQuote?.destinationAmount
              ? NumberUtil.formatNumberToLocalString(selectedQuote.destinationAmount, 5)
              : NumberUtil.formatNumberToLocalString(0, 5)
              } ${purchaseCurrencyCode ?? ''}`}
            onValueChange={onValueChange}
            style={styles.currencyInput}
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
            disabled={!selectedPaymentMethod || !paymentAmount}
            testID="payment-method-button"
          >
            <FlexView>
              {selectedPaymentMethod?.name && (
                <Text variant="paragraph-400" color="fg-100">
                  {selectedPaymentMethod.name}
                </Text>
              )}
              {getProviderButtonText() && (
                <FlexView flexDirection="row" alignItems="center" margin={['3xs', '0', '0', '0']}>
                  <Text variant="small-400" color="fg-150">
                    {getProviderButtonText()}
                  </Text>
                  {selectedQuote && (
                    <>
                      {providerImage && (
                        <Image source={providerImage} style={styles.providerImage} />
                      )}
                      <Text variant="small-400" color="fg-150">
                        {StringUtil.capitalize(selectedQuote?.serviceProvider)}
                      </Text>
                    </>
                  )}
                </FlexView>
              )}
            </FlexView>
          </ListItem>
          <FlexView
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            margin={['m', '0', '0', '0']}
          >
            <Button variant="shade" style={styles.cancelButton} onPress={RouterController.goBack}>
              Cancel
            </Button>
            <Button
              style={styles.continueButton}
              onPress={handleContinue}
              disabled={quotesLoading || loading || !selectedQuote}
              testID="button-continue"
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
            items={getPurchaseCurrencies(searchValue, true)}
            onSearch={handleSearch}
            renderItem={renderCurrencyItem}
            keyExtractor={item => item.currencyCode}
            title="Select token"
            itemHeight={CURRENCY_ITEM_HEIGHT}
            showNetwork
          />
        </FlexView>
      </ScrollView>
    </>
  );
}
