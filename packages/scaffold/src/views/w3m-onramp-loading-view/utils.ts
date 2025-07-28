import { NumberUtil } from '@reown/appkit-common-react-native';
import { OnRampController } from '@reown/appkit-core-react-native';

export interface OnRampUrlData {
  purchaseCurrency: string | null;
  purchaseAmount: string | null;
  purchaseImageUrl: string;
  paymentCurrency: string | null;
  paymentAmount: string | null;
  network: string | null;
  status: string | null;
  orderId: string | null;
}

export function parseOnRampRedirectUrl(url: string): OnRampUrlData | null {
  try {
    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);

    const asset =
      searchParams.get('cryptoCurrency') ??
      OnRampController.state.purchaseCurrency?.currencyCode ??
      null;
    const network =
      searchParams.get('network') ?? OnRampController.state.purchaseCurrency?.chainName ?? null;

    const purchaseAmountParam = searchParams.get('cryptoAmount');
    const purchaseAmount = purchaseAmountParam
      ? (() => {
          const parsed = parseFloat(purchaseAmountParam);

          return isNaN(parsed)
            ? OnRampController.state.selectedQuote?.destinationAmount ?? null
            : parsed;
        })()
      : OnRampController.state.selectedQuote?.destinationAmount ?? null;

    const amountParam = searchParams.get('fiatAmount');
    const amount = amountParam
      ? (() => {
          const parsed = parseFloat(amountParam);

          return isNaN(parsed) ? OnRampController.state.paymentAmount ?? null : parsed;
        })()
      : OnRampController.state.paymentAmount ?? null;

    const currency =
      searchParams.get('fiatCurrency') ??
      OnRampController.state.paymentCurrency?.currencyCode ??
      null;
    const orderId = searchParams.get('orderId') ?? searchParams.get('partnerOrderId');
    const status = searchParams.get('status');

    return {
      purchaseCurrency: asset,
      purchaseAmount: purchaseAmount ? NumberUtil.formatNumberToLocalString(purchaseAmount) : null,
      purchaseImageUrl: OnRampController.state.purchaseCurrency?.symbolImageUrl ?? '',
      paymentCurrency: currency,
      paymentAmount: amount ? NumberUtil.formatNumberToLocalString(amount) : null,
      network,
      status,
      orderId
    };
  } catch (error) {
    // Return null if URL parsing fails
    return null;
  }
}

export function createEmptyOnRampResult(): OnRampUrlData {
  return {
    purchaseCurrency: null,
    purchaseAmount: null,
    purchaseImageUrl: '',
    paymentCurrency: null,
    paymentAmount: null,
    network: null,
    status: null,
    orderId: null
  };
}
