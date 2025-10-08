import type { AppKitNetwork } from '@reown/appkit-common-react-native';

export const UnitsUtil = {
  parseSatoshis(amount: string, network: AppKitNetwork): string {
    const value = parseFloat(amount) / 10 ** network.nativeCurrency.decimals;

    return Intl.NumberFormat('en-US', {
      maximumFractionDigits: network.nativeCurrency.decimals
    }).format(value);
  }
};
