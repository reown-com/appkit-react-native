import { useSnapshot } from 'valtio';
import { useCallback, useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import {
  NetworkController,
  RouterController,
  SwapController
} from '@reown/appkit-core-react-native';
import { Button, FlexView, IconBox, Spacing } from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';

import { useKeyboard } from '../../hooks/useKeyboard';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { SwapInput } from '../../partials/w3m-swap-input';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import styles from './styles';
import { SwapDetails } from '../../partials/w3m-swap-details';

export function SwapView() {
  const { padding } = useCustomDimensions();
  const {
    initializing,
    sourceToken,
    toToken,
    sourceTokenAmount,
    toTokenAmount,
    loadingPrices,
    loadingQuote,
    sourceTokenPriceInUSD,
    toTokenPriceInUSD,
    inputError
  } = useSnapshot(SwapController.state);
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const showDetails = !!sourceToken && !!toToken && !inputError;

  const getActionButtonState = () => {
    // if (fetchError) {
    //   return 'Swap'
    // }

    if (!SwapController.state.sourceToken || !SwapController.state.toToken) {
      return { text: 'Select token', disabled: true };
    }

    if (!SwapController.state.sourceTokenAmount || !SwapController.state.toTokenAmount) {
      return { text: 'Enter amount', disabled: true };
    }

    if (SwapController.state.inputError) {
      return { text: SwapController.state.inputError, disabled: true };
    }

    return { text: 'Review swap', disabled: false };
  };

  const actionState = getActionButtonState();
  const actionLoading = initializing || loadingPrices || loadingQuote;

  const onDebouncedSwap = useDebounceCallback({
    callback: SwapController.swapTokens.bind(SwapController),
    delay: 400
  });

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const onSourceTokenChange = (value: string) => {
    SwapController.setSourceTokenAmount(value);
    onDebouncedSwap();
  };

  const onToTokenChange = (value: string) => {
    SwapController.setToTokenAmount(value);
    onDebouncedSwap();
  };

  const onSourceTokenPress = () => {
    RouterController.push('SwapSelectToken', { swapTarget: 'sourceToken' });
  };

  const onSourceMaxPress = () => {
    const isNetworkToken =
      SwapController.state.sourceToken?.address ===
      NetworkController.getActiveNetworkTokenAddress();

    const _gasPriceInUSD = SwapController.state.gasPriceInUSD;
    const _sourceTokenPriceInUSD = SwapController.state.sourceTokenPriceInUSD;
    const _balance = SwapController.state.sourceToken?.quantity.numeric;

    if (_balance) {
      if (!_gasPriceInUSD) {
        return SwapController.setSourceTokenAmount(_balance);
      }

      const amountOfTokenGasRequires = NumberUtil.bigNumber(_gasPriceInUSD.toFixed(5)).dividedBy(
        _sourceTokenPriceInUSD
      );

      const maxValue = isNetworkToken
        ? NumberUtil.bigNumber(_balance).minus(amountOfTokenGasRequires)
        : NumberUtil.bigNumber(_balance);

      SwapController.setSourceTokenAmount(maxValue.isGreaterThan(0) ? maxValue.toFixed(20) : '0');
    }
  };

  const onToTokenPress = () => {
    RouterController.push('SwapSelectToken', { swapTarget: 'toToken' });
  };

  const watchTokens = useCallback(() => {
    SwapController.getNetworkTokenPrice();
    SwapController.getMyTokensWithBalance();
    SwapController.swapTokens();
  }, []);

  useEffect(() => {
    SwapController.initializeState();

    const interval = setInterval(watchTokens, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [watchTokens]);

  return (
    <ScrollView
      style={{ paddingHorizontal: padding }}
      bounces={false}
      keyboardShouldPersistTaps="always"
    >
      <FlexView padding="l" alignItems="center" justifyContent="center" style={{ paddingBottom }}>
        <SwapInput
          token={sourceToken}
          value={sourceTokenAmount}
          marketValue={parseFloat(sourceTokenAmount) * sourceTokenPriceInUSD}
          style={styles.tokenInput}
          loading={initializing}
          onChange={onSourceTokenChange}
          onTokenPress={onSourceTokenPress}
          onMaxPress={onSourceMaxPress}
          autoFocus
        />
        <FlexView alignItems="center" justifyContent="center" style={styles.bottomInputContainer}>
          <SwapInput
            token={toToken}
            value={toTokenAmount}
            marketValue={NumberUtil.parseLocalStringToNumber(toTokenAmount) * toTokenPriceInUSD}
            style={styles.tokenInput}
            loading={initializing}
            onChange={onToTokenChange}
            onTokenPress={onToTokenPress}
            editable={false}
          />
          <IconBox
            icon="recycleHorizontal"
            size="lg"
            iconColor="fg-275"
            background
            backgroundColor="bg-175"
            border
            borderColor="bg-100"
            borderSize={10}
            style={styles.arrowIcon}
          />
        </FlexView>
        {showDetails && <SwapDetails />}
        <Button
          style={styles.actionButton}
          loading={actionLoading}
          disabled={actionState.disabled || actionLoading}
        >
          {actionState.text}
        </Button>
      </FlexView>
    </ScrollView>
  );
}
