import { OnRampController, NetworkController } from '@reown/appkit-core-react-native';

export const getErrorMessage = (error?: string) => {
  if (!error) {
    return undefined;
  }

  if (error === 'INVALID_AMOUNT_TOO_LOW') {
    return 'Amount is too low';
  }

  if (error === 'INVALID_AMOUNT_TOO_HIGH') {
    return 'Amount is too high';
  }

  if (error === 'INVALID_AMOUNT') {
    return 'No provider found for this amount';
  }

  if (error === 'UNKNOWN_ERROR') {
    return 'Failed to load. Please try again';
  }

  return error;
};

export const getModalTitle = (
  modalType?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quotes'
) => {
  if (modalType === 'country') {
    return 'Select your country';
  }
  if (modalType === 'paymentMethod') {
    return 'Payment method';
  }
  if (modalType === 'paymentCurrency') {
    return 'Select a currency';
  }
  if (modalType === 'purchaseCurrency') {
    return 'Select a token';
  }
  if (modalType === 'quotes') {
    return 'Select a provider';
  }

  return undefined;
};

export const getModalItems = (
  modalType?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency',
  searchValue?: string
) => {
  if (modalType === 'country') {
    if (searchValue) {
      return (
        OnRampController.state.countries?.filter(
          country =>
            country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            country.countryCode.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.countries || [];
  }
  if (modalType === 'paymentMethod') {
    if (searchValue) {
      return (
        OnRampController.state.paymentMethods?.filter(paymentMethod =>
          paymentMethod.name.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.paymentMethods || [];
  }
  if (modalType === 'paymentCurrency') {
    if (searchValue) {
      return (
        OnRampController.state.paymentCurrencies?.filter(
          paymentCurrency =>
            paymentCurrency.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            paymentCurrency.currencyCode.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.paymentCurrencies || [];
  }
  if (modalType === 'purchaseCurrency') {
    const networkId = NetworkController.state.caipNetwork?.id?.split(':')[1];
    let filteredCurrencies =
      OnRampController.state.purchaseCurrencies?.filter(c => c.chainId === networkId) || [];

    if (searchValue) {
      return filteredCurrencies.filter(
        currency =>
          currency.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          currency.currencyCode.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filteredCurrencies;
  }

  return [];
};
