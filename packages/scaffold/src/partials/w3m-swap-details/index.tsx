import { useSnapshot } from 'valtio';
import { ConstantsUtil, NetworkController, SwapController } from '@reown/appkit-core-react-native';
import {
  FlexView,
  Text,
  UiUtil,
  Toggle,
  useTheme,
  Pressable,
  Icon
} from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';

import { type ModalData } from '../w3m-information-modal';
import { getModalData } from './utils';
import styles from './styles';

interface SwapDetailsProps {
  initialOpen?: boolean;
  canClose?: boolean;
  onInfoPress: (info: ModalData) => void;
}

// -- Constants ----------------------------------------- //
const slippageRate = ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE;

export function SwapDetails({ initialOpen, canClose, onInfoPress }: SwapDetailsProps) {
  const Theme = useTheme();
  const {
    maxSlippage = 0,
    sourceToken,
    toToken,
    gasPriceInUSD = 0,
    priceImpact,
    toTokenAmount
  } = useSnapshot(SwapController.state);

  const toTokenSwappedAmount =
    SwapController.state.sourceTokenPriceInUSD && SwapController.state.toTokenPriceInUSD
      ? (1 / SwapController.state.toTokenPriceInUSD) * SwapController.state.sourceTokenPriceInUSD
      : 0;

  const renderTitle = () => (
    <FlexView flexDirection="row" alignItems="flex-start">
      <Text variant="small-400" color="fg-100">
        1 {SwapController.state.sourceToken?.symbol} = {''}
        {UiUtil.formatNumberToLocalString(toTokenSwappedAmount, 3)}{' '}
        {SwapController.state.toToken?.symbol}
      </Text>
      <Text variant="small-400" color="fg-200" style={styles.titlePrice}>
        ~$
        {UiUtil.formatNumberToLocalString(SwapController.state.sourceTokenPriceInUSD)}
      </Text>
    </FlexView>
  );

  const minimumReceive = NumberUtil.parseLocalStringToNumber(toTokenAmount) - maxSlippage;
  const providerFee = SwapController.getProviderFeePrice();

  const onPriceImpactPress = () => {
    onInfoPress?.(getModalData('priceImpact'));
  };

  const onSlippagePress = () => {
    const minimumString = UiUtil.formatNumberToLocalString(
      minimumReceive,
      minimumReceive < 1 ? 8 : 2
    );
    onInfoPress?.(
      getModalData('slippage', {
        minimumReceive: minimumString,
        toTokenSymbol: SwapController.state.toToken?.symbol
      })
    );
  };

  const onNetworkCostPress = () => {
    onInfoPress?.(
      getModalData('networkCost', {
        networkSymbol: SwapController.state.networkTokenSymbol,
        networkName: NetworkController.state.caipNetwork?.name
      })
    );
  };

  return (
    <>
      <Toggle
        title={renderTitle()}
        style={[styles.container, { backgroundColor: Theme['gray-glass-005'] }]}
        initialOpen={initialOpen}
        canClose={canClose}
      >
        <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
          <FlexView flexDirection="row" alignItems="center">
            <Text variant="small-400" color="fg-150" style={styles.detailTitle}>
              Network cost
            </Text>
            <Pressable onPress={onNetworkCostPress} style={styles.infoIcon} hitSlop={10}>
              <Icon name="infoCircle" size="sm" color="fg-150" />
            </Pressable>
          </FlexView>
          <Text variant="small-400" color="fg-100">
            ${UiUtil.formatNumberToLocalString(gasPriceInUSD, gasPriceInUSD < 1 ? 8 : 2)}
          </Text>
        </FlexView>
        {!!priceImpact && (
          <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
            <FlexView flexDirection="row" alignItems="center">
              <Text variant="small-400" color="fg-150" style={styles.detailTitle}>
                Price impact
              </Text>
              <Pressable onPress={onPriceImpactPress} style={styles.infoIcon} hitSlop={10}>
                <Icon name="infoCircle" size="sm" color="fg-150" />
              </Pressable>
            </FlexView>
            <Text variant="small-400" color="fg-100">
              ~{UiUtil.formatNumberToLocalString(priceImpact, 3)}%
            </Text>
          </FlexView>
        )}
        {maxSlippage !== undefined && maxSlippage > 0 && !!sourceToken?.symbol && (
          <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
            <FlexView flexDirection="row" alignItems="center">
              <Text variant="small-400" color="fg-150" style={styles.detailTitle}>
                Max. slippage
              </Text>
              <Pressable onPress={onSlippagePress} style={styles.infoIcon} hitSlop={10}>
                <Icon name="infoCircle" size="sm" color="fg-150" />
              </Pressable>
            </FlexView>
            <Text variant="small-400" color="fg-200">
              {UiUtil.formatNumberToLocalString(maxSlippage, 6)} {toToken?.symbol}{' '}
              <Text variant="small-400" color="fg-100">
                {slippageRate}%
              </Text>
            </Text>
          </FlexView>
        )}
        <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
          <Text variant="small-400" color="fg-150" style={styles.detailTitle}>
            Included provider fee
          </Text>
          <Text variant="small-400" color="fg-100">
            ${UiUtil.formatNumberToLocalString(providerFee, providerFee < 1 ? 8 : 2)}
          </Text>
        </FlexView>
      </Toggle>
    </>
  );
}
