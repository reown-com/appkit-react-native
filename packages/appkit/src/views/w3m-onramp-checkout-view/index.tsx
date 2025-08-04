import {
  AssetController,
  AssetUtil,
  ConnectionsController,
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
  Toggle,
  useTheme
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';
import { NumberUtil, StringUtil } from '@reown/appkit-common-react-native';

export function OnRampCheckoutView() {
  const Theme = useTheme();
  const { themeMode } = useSnapshot(ThemeController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const { selectedQuote, selectedPaymentMethod, purchaseCurrency } = useSnapshot(
    OnRampController.state
  );

  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);

  const value = NumberUtil.roundNumber(selectedQuote?.destinationAmount ?? 0, 6, 5);
  const symbol = selectedQuote?.destinationCurrencyCode;
  const paymentLogo = selectedPaymentMethod?.logos[themeMode ?? 'light'];
  const providerImage = OnRampController.getServiceProviderImage(
    selectedQuote?.serviceProvider ?? ''
  );

  const showNetworkFee = selectedQuote?.networkFee != null;
  const showTransactionFee = selectedQuote?.transactionFee != null;
  const showTotalFee = selectedQuote?.totalFee != null;
  const showFees = showNetworkFee || showTransactionFee || showTotalFee;

  const onConfirm = () => {
    RouterController.push('OnRampLoading');
  };

  return (
    <FlexView padding={['2xl', 'l', '4xl', 'l']}>
      <FlexView alignItems="center">
        <Text color="fg-200">You Buy</Text>
        <FlexView flexDirection="row" alignItems="center">
          <Text style={[styles.amount, { color: Theme['fg-100'] }]}>{value}</Text>
          <Text variant="paragraph-400" color="fg-200">
            {symbol?.split('_')[0] ?? symbol ?? ''}
          </Text>
        </FlexView>
        <FlexView flexDirection="row" alignItems="center" justifyContent="center">
          <Text color="fg-200">via </Text>
          {providerImage ? <Image source={providerImage} style={styles.providerImage} /> : null}
          <Text color="fg-200">{StringUtil.capitalize(selectedQuote?.serviceProvider)}</Text>
        </FlexView>
      </FlexView>
      <Separator style={styles.separator} color="gray-glass-010" />
      <FlexView
        padding={['s', 's', 'xs', 's']}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text color="fg-200">You Pay</Text>
        <Text>
          {selectedQuote?.sourceAmount} {selectedQuote?.sourceCurrencyCode}
        </Text>
      </FlexView>
      <FlexView
        padding={['xs', 's', 'xs', 's']}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text color="fg-200">You Receive</Text>
        <FlexView flexDirection="row" alignItems="center">
          <Text>
            {value} {symbol?.split('_')[0] ?? ''}
          </Text>
          {purchaseCurrency?.symbolImageUrl ? <Image
              source={purchaseCurrency?.symbolImageUrl}
              style={[styles.tokenImage, { borderColor: Theme['gray-glass-010'] }]}
            /> : null}
        </FlexView>
      </FlexView>
      <FlexView
        padding={['xs', 's', 'xs', 's']}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="fg-200">Network</Text>
        <FlexView flexDirection="row" alignItems="center">
          <Text>{purchaseCurrency?.chainName}</Text>
        </FlexView>
      </FlexView>
      <FlexView
        padding={['xs', 's', 'm', 's']}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="fg-200">Pay with</Text>
        <FlexView
          flexDirection="row"
          alignItems="center"
          style={[styles.paymentMethodContainer, { borderColor: Theme['gray-glass-020'] }]}
        >
          {paymentLogo ? <Image
              source={paymentLogo}
              style={styles.paymentMethodImage}
              tintColor={Theme['fg-150']}
            /> : null}
          <Text variant="small-600" color="fg-150">
            {selectedPaymentMethod?.name}
          </Text>
        </FlexView>
      </FlexView>

      {showFees ? <Toggle
          title={
            <>
              <Text variant="paragraph-400" color="fg-200">
                Fees{' '}
                {showTotalFee ? <Text variant="paragraph-400">
                    {selectedQuote?.totalFee} {selectedQuote?.sourceCurrencyCode}
                  </Text> : null}
              </Text>
            </>
          }
          style={[styles.feesToggle, { backgroundColor: Theme['gray-glass-002'] }]}
          contentContainerStyle={styles.feesToggleContent}
        >
          {showNetworkFee ? <FlexView
              flexDirection="row"
              justifyContent="space-between"
              style={[styles.toggleItem, { backgroundColor: Theme['gray-glass-002'] }]}
              margin={['0', '0', 'xs', '0']}
            >
              <Text variant="small-500" color="fg-150">
                Network Fees
              </Text>
              <FlexView flexDirection="row" alignItems="center">
                {networkImage ? <Image
                    source={networkImage}
                    style={[styles.networkImage, { borderColor: Theme['gray-glass-010'] }]}
                  /> : null}
                <Text variant="small-400">
                  {selectedQuote?.networkFee} {selectedQuote?.sourceCurrencyCode}
                </Text>
              </FlexView>
            </FlexView> : null}
          {showTransactionFee ? <FlexView
              flexDirection="row"
              justifyContent="space-between"
              style={[styles.toggleItem, { backgroundColor: Theme['gray-glass-002'] }]}
            >
              <Text variant="small-500" color="fg-150">
                Transaction Fees
              </Text>
              <Text variant="small-400">
                {selectedQuote.transactionFee} {selectedQuote?.sourceCurrencyCode}
              </Text>
            </FlexView> : null}
        </Toggle> : null}
      <FlexView flexDirection="row" justifyContent="space-between" margin={['xl', '0', '0', '0']}>
        <Button
          variant="shade"
          size="md"
          style={styles.cancelButton}
          onPress={RouterController.goBack}
        >
          Back
        </Button>
        <Button
          variant="fill"
          size="md"
          style={styles.confirmButton}
          onPress={onConfirm}
          testID="button-confirm"
        >
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
  feesToggle: {
    borderRadius: BorderRadius.xs
  },
  feesToggleContent: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs
  },
  toggleItem: {
    padding: Spacing.s,
    borderRadius: BorderRadius.xxs
  },
  paymentMethodImage: {
    width: 14,
    height: 14,
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
  },
  tokenImage: {
    height: 20,
    width: 20,
    marginLeft: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1
  },
  networkImage: {
    height: 16,
    width: 16,
    marginRight: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1
  },
  paymentMethodContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.full,
    padding: Spacing.xs
  }
});
