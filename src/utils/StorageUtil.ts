import AsyncStorage from '@react-native-async-storage/async-storage';

export const setDeepLinkWallet = (universalLink: string) => {
  return AsyncStorage.setItem(
    'WALLETCONNECT_DEEPLINK_CHOICE',
    JSON.stringify({ href: universalLink })
  );
};

export const removeDeepLinkWallet = () => {
  AsyncStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
};
