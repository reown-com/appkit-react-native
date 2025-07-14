import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';
import { RouterController, SwapController } from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  Icon,
  Spacing,
  Text,
  TokenButton,
  UiUtil
} from '@reown/appkit-ui-react-native';
import { SwapDetails } from '../../partials/w3m-swap-details';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { useKeyboard } from '../../hooks/useKeyboard';
import styles from './styles';

export function SwapPreviewView() {
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const {
    sourceToken,
    sourceTokenAmount,
    sourceTokenPriceInUSD,
    toToken,
    toTokenAmount,
    toTokenPriceInUSD,
    loadingQuote,
    loadingBuildTransaction,
    loadingTransaction,
    loadingApprovalTransaction
  } = useSnapshot(SwapController.state);

  const sourceTokenMarketValue =
    NumberUtil.parseLocalStringToNumber(sourceTokenAmount) * sourceTokenPriceInUSD;
  const toTokenMarketValue = NumberUtil.parseLocalStringToNumber(toTokenAmount) * toTokenPriceInUSD;

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const loading =
    loadingQuote || loadingBuildTransaction || loadingTransaction || loadingApprovalTransaction;

  const onCancel = () => {
    SwapController.clearTransactionLoaders();
    RouterController.goBack();
  };

  const onSwap = () => {
    if (SwapController.state.approvalTransaction) {
      SwapController.sendTransactionForApproval(SwapController.state.approvalTransaction);
    } else {
      SwapController.sendTransactionForSwap(SwapController.state.swapTransaction);
    }
  };

  useEffect(() => {
    function refreshTransaction() {
      if (!SwapController.state.loadingApprovalTransaction) {
        SwapController.getTransaction();
      }
    }

    SwapController.getTransaction();

    const interval = setInterval(refreshTransaction, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <ScrollView
      style={{ paddingHorizontal: padding }}
      bounces={false}
      keyboardShouldPersistTaps="always"
    >
      <FlexView padding="l" justifyContent="center" style={{ paddingBottom }}>
        <FlexView flexDirection="row" justifyContent="space-between">
          <FlexView>
            <Text variant="small-400" color="fg-150">
              Send
            </Text>
            <Text variant="paragraph-400" color="fg-100">
              ${UiUtil.formatNumberToLocalString(sourceTokenMarketValue, 6)}
            </Text>
          </FlexView>
          <TokenButton
            text={` ${UiUtil.formatNumberToLocalString(
              sourceTokenAmount,
              8
            )} ${sourceToken?.symbol}`}
            imageUrl={sourceToken?.logoUri}
            inverse
            disabled
          />
        </FlexView>
        <Icon name="recycleHorizontal" size="md" color="fg-200" style={styles.swapIcon} />
        <FlexView flexDirection="row" justifyContent="space-between" margin={['0', '0', 'xl', '0']}>
          <FlexView>
            <Text variant="small-400" color="fg-150">
              Receive
            </Text>
            <Text variant="paragraph-400" color="fg-100">
              ${UiUtil.formatNumberToLocalString(toTokenMarketValue, 6)}
            </Text>
          </FlexView>
          <TokenButton
            text={` ${toTokenAmount} ${toToken?.symbol}`}
            imageUrl={toToken?.logoUri}
            inverse
            disabled
          />
        </FlexView>
        <SwapDetails initialOpen={true} canClose={false} />
        <FlexView
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          margin={['m', '0', 'm', '0']}
        >
          <Icon name="warningCircle" size="sm" color="fg-200" style={styles.reviewIcon} />
          <Text variant="small-400" color="fg-200">
            Review transaction carefully
          </Text>
        </FlexView>
        <FlexView flexDirection="row">
          <Button variant="shade" style={styles.cancelButton} onPress={onCancel}>
            Cancel
          </Button>
          <Button
            variant="fill"
            style={styles.sendButton}
            loading={loading}
            disabled={loading}
            onPress={onSwap}
          >
            Swap
          </Button>
        </FlexView>
      </FlexView>
    </ScrollView>
  );
}
