import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { Platform, ScrollView } from 'react-native';
import { RouterController, SwapController } from '@reown/appkit-core-react-native';
import { FlexView, IconBox, Spacing } from '@reown/appkit-ui-react-native';

import { useKeyboard } from '../../hooks/useKeyboard';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';
import { SwapInput } from '../../partials/w3m-swap-input';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';

export function SwapView() {
  const { padding } = useCustomDimensions();
  const { initializing, sourceToken, toToken, sourceTokenAmount, toTokenAmount } = useSnapshot(
    SwapController.state
  );
  const { keyboardShown, keyboardHeight } = useKeyboard();
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

  const onToTokenPress = () => {
    RouterController.push('SwapSelectToken', { swapTarget: 'toToken' });
  };

  useEffect(() => {
    SwapController.initializeState();
    // watch values
  }, []);

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
          style={styles.tokenInput}
          loading={initializing}
          onChange={onSourceTokenChange}
          onTokenPress={onSourceTokenPress}
        />
        <FlexView alignItems="center" justifyContent="center" style={styles.bottomInputContainer}>
          <SwapInput
            style={styles.tokenInput}
            loading={initializing}
            token={toToken}
            value={toTokenAmount}
            onChange={onToTokenChange}
            onTokenPress={onToTokenPress}
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
      </FlexView>
    </ScrollView>
  );
}
