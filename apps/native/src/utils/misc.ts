import { Platform } from 'react-native';

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet',
      name: 'Wallet(RN)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'rn-web3wallet://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit'
    },
    {
      id: 'flutter-wallet',
      name: 'Wallet(Flutter)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'wcflutterwallet://',
      link_mode: 'https://appkit-lab.reown.com/flutter_walletkit'
    }
  ];

  if (Platform.OS === 'android') {
    wallets.push({
      id: 'android-wallet',
      name: 'Wallet(Android)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'kotlin-web3wallet://',
      link_mode: 'https://appkit-lab.reown.com/wallet'
    });
  } else if (Platform.OS === 'ios') {
    wallets.push({
      id: 'ios-wallet',
      name: 'Wallet(iOS)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'walletapp://',
      link_mode: 'https://appkit-lab.reown.com/wallet'
    });
  }

  return wallets;
};
