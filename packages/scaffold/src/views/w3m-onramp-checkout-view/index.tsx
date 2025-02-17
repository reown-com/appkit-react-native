import { View } from 'react-native';
import {
  OnRampController,
  RouterController,
  ThemeController
} from '@reown/appkit-core-react-native';
import {
  BorderRadius,
  Button,
  FlexView,
  Image,
  Separator,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';
import { NumberUtil, StringUtil } from '@reown/appkit-common-react-native';

export function OnRampCheckoutView() {
  const Theme = useTheme();
  const { themeMode } = useSnapshot(ThemeController.state);
  const { selectedQuote, selectedPaymentMethod, purchaseCurrency } = useSnapshot(
    OnRampController.state
  );

  const value = NumberUtil.roundNumber(selectedQuote?.destinationAmount ?? 0, 6, 5);
  const symbol = selectedQuote?.destinationCurrencyCode;
  const paymentLogo = selectedPaymentMethod?.logos[themeMode ?? 'light'];
  const providerImage = OnRampController.getServiceProviderImage(
    selectedQuote?.serviceProvider ?? ''
  );

  const onConfirm = () => {
    RouterController.push('OnRampLoading');
  };

  return (
    <FlexView padding={['2xl', 'l', '4xl', 'l']}>
      <FlexView alignItems="center">
        <Text color="fg-200">You Buy</Text>
        <FlexView flexDirection="row" alignItems="center">
          <Text style={[styles.amount, { color: Theme['fg-100'] }]}>{value}</Text>
          <Text variant="large-400" color="fg-200">
            {symbol ?? ''}
          </Text>
        </FlexView>
        <FlexView flexDirection="row" alignItems="center" justifyContent="center">
          <Text color="fg-200">via </Text>
          {providerImage && <Image source={providerImage} style={styles.providerImage} />}
          <Text color="fg-200">{StringUtil.capitalize(selectedQuote?.serviceProvider)}</Text>
        </FlexView>
      </FlexView>
      <Separator style={styles.separator} color="gray-glass-010" />
      <FlexView padding={['s', 's', 'xs', 's']} flexDirection="row" justifyContent="space-between">
        <Text color="fg-200">You Pay</Text>
        <Text>
          {selectedQuote?.sourceAmount} {selectedQuote?.sourceCurrencyCode}
        </Text>
      </FlexView>
      <FlexView padding={['xs', 's', 'xs', 's']} flexDirection="row" justifyContent="space-between">
        <Text color="fg-200">You Receive</Text>
        <FlexView alignItems="flex-end">
          <Text>
            {value} {symbol}
          </Text>
          <Text variant="small-400" color="fg-200">
            {selectedQuote?.fiatAmountWithoutFees} {selectedQuote?.sourceCurrencyCode}
          </Text>
        </FlexView>
      </FlexView>
      <FlexView padding={['xs', 's', 'm', 's']} flexDirection="row" justifyContent="space-between">
        <Text color="fg-200">Pay with</Text>
        <FlexView flexDirection="row" alignItems="center">
          {paymentLogo && <Image source={paymentLogo} style={styles.paymentMethodImage} />}
          <Text>{selectedPaymentMethod?.name}</Text>
        </FlexView>
      </FlexView>
      {purchaseCurrency?.chainName && (
        <FlexView
          padding={['xs', 's', 'm', 's']}
          flexDirection="row"
          justifyContent="space-between"
        >
          <Text color="fg-200">Network</Text>
          <FlexView flexDirection="row" alignItems="center">
            <Text>{purchaseCurrency.chainName}</Text>
          </FlexView>
        </FlexView>
      )}
      <FlexView
        padding={['m', 'l', 's', 'l']}
        style={[styles.feesContainer, { backgroundColor: Theme['gray-glass-005'] }]}
      >
        <FlexView flexDirection="row" justifyContent="space-between">
          <Text color="fg-200">Network Fees</Text>
          {selectedQuote?.networkFee ? (
            <Text>
              {selectedQuote?.networkFee} {selectedQuote?.sourceCurrencyCode}
            </Text>
          ) : (
            <Text>unknown</Text>
          )}
        </FlexView>
        <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', 's', '0']}>
          <Text color="fg-200">Transaction Fees</Text>
          {selectedQuote?.transactionFee ? (
            <Text>
              {selectedQuote.transactionFee} {selectedQuote?.sourceCurrencyCode}
            </Text>
          ) : (
            <Text>unknown</Text>
          )}
        </FlexView>
        <FlexView flexDirection="row" justifyContent="space-between">
          <Text color="fg-200">Total</Text>
          <View style={[styles.totalFee, { backgroundColor: Theme['accent-glass-010'] }]}>
            {selectedQuote?.totalFee ? (
              <Text color="accent-100">
                {selectedQuote.totalFee} {selectedQuote?.sourceCurrencyCode}
              </Text>
            ) : (
              <Text>unknown</Text>
            )}
          </View>
        </FlexView>
      </FlexView>
      <FlexView flexDirection="row" justifyContent="space-between" margin={['xl', '0', '0', '0']}>
        <Button
          variant="shade"
          size="md"
          style={styles.cancelButton}
          onPress={RouterController.goBack}
        >
          Back
        </Button>
        <Button variant="fill" size="md" style={styles.confirmButton} onPress={onConfirm}>
          Confirm
        </Button>
      </FlexView>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 38,
    marginRight: Spacing['3xs']
  },
  separator: {
    marginVertical: Spacing.m
  },
  feesContainer: {
    borderRadius: BorderRadius.s
  },
  totalFee: {
    padding: Spacing['3xs'],
    borderRadius: BorderRadius['3xs']
  },
  paymentMethodImage: {
    width: 20,
    height: 20,
    marginRight: Spacing['3xs']
  },
  confirmButton: {
    marginLeft: Spacing.s,
    flex: 3
  },
  cancelButton: {
    flex: 1
  },
  providerImage: {
    height: 16,
    width: 16,
    marginRight: 2
  }
});
