import { OnRampController, NetworkController } from '@reown/appkit-core-react-native';

export const getModalTitle = (
  modalType?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quotes'
) => {
  if (modalType === 'country') {
    return 'Select your country';
  }
  if (modalType === 'paymentMethod') {
    return 'Select payment method';
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
  modalType?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quotes'
) => {
  if (modalType === 'country') {
    return OnRampController.state.countries || [];
  }
  if (modalType === 'paymentMethod') {
    return OnRampController.state.paymentMethods || [];
  }
  if (modalType === 'paymentCurrency') {
    return OnRampController.state.paymentCurrencies || [];
  }
  if (modalType === 'purchaseCurrency') {
    return (
      OnRampController.state.purchaseCurrencies?.filter(
        currency => currency.chainId === NetworkController.state.caipNetwork?.id.split(':')[1]
      ) || []
    );
  }
  if (modalType === 'quotes') {
    return OnRampController.state.quotes || [];
  }

  return [];
};
