import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import {
  ConnectionsController,
  ConstantsUtil,
  EventsController,
  RouterController,
  SwapController,
  type SwapInputTarget
} from '@reown/appkit-core-react-native';
import { Button, FlexView, IconLink, Spacing, useTheme } from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';

import { useKeyboard } from '../../hooks/useKeyboard';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { SwapInput } from '../../partials/w3m-swap-input';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { SwapDetails } from '../../partials/w3m-swap-details';
import styles from './styles';
import { SwapSelectTokenView } from './components/select-token-view';

export function SwapView() {
  const {
    loadingTokens,
    sourceToken,
    toToken,
    sourceTokenAmount,
    toTokenAmount,
    loadingPrices,
    loadingQuote,
    sourceTokenPriceInUSD,
    toTokenPriceInUSD,
    myTokensWithBalance,
    inputError
  } = useSnapshot(SwapController.state);
  const Theme = useTheme();
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const [showModal, setShowModal] = useState<SwapInputTarget | undefined>();
  const showDetails = !!sourceToken && !!toToken && !inputError;

  const onModalClose = () => {
    setShowModal(undefined);
  };

  const showSwitch =
    myTokensWithBalance &&
    myTokensWithBalance.findIndex(
      token => token.address === SwapController.state.toToken?.address
    ) >= 0;

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const getActionButtonState = () => {
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
  const actionLoading = loadingTokens || loadingPrices || loadingQuote;

  const { debouncedCallback: onDebouncedSwap } = useDebounceCallback({
    callback: SwapController.swapTokens.bind(SwapController),
    delay: 400
  });

  const onSourceTokenChange = (value: string) => {
    SwapController.setSourceTokenAmount(value);
    onDebouncedSwap();
  };

  const onToTokenChange = (value: string) => {
    SwapController.setToTokenAmount(value);
    onDebouncedSwap();
  };

  const onReviewPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'INITIATE_SWAP',
      properties: {
        network: ConnectionsController.state.activeNetwork?.caipNetworkId || '',
        swapFromToken: SwapController.state.sourceToken?.symbol || '',
        swapToToken: SwapController.state.toToken?.symbol || '',
        swapFromAmount: SwapController.state.sourceTokenAmount || '',
        swapToAmount: SwapController.state.toTokenAmount || '',
        isSmartAccount: ConnectionsController.state.accountType === 'smartAccount'
      }
    });
    RouterController.push('SwapPreview');
  };

  const onSourceMaxPress = () => {
    const { activeNamespace, activeCaipNetworkId } = ConnectionsController.state;
    const networkTokenAddress = activeNamespace
      ? `${activeCaipNetworkId}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS[activeNamespace]}`
      : undefined;

    const isNetworkToken = SwapController.state.sourceToken?.address === networkTokenAddress;

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
      SwapController.swapTokens();
    }
  };

  const onSwitchPress = () => {
    SwapController.switchTokens();
  };

  useEffect(() => {
    SwapController.fetchTokens();

    function watchTokens() {
      SwapController.getNetworkTokenPrice();
      SwapController.getMyTokensWithBalance();
      SwapController.swapTokens();
    }

    const interval = setInterval(watchTokens, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
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
            loading={loadingTokens}
            onChange={onSourceTokenChange}
            onTokenPress={() => setShowModal('sourceToken')}
            onMaxPress={onSourceMaxPress}
          />
          <FlexView alignItems="center" justifyContent="center" style={styles.bottomInputContainer}>
            <SwapInput
              token={toToken}
              value={toTokenAmount}
              marketValue={NumberUtil.parseLocalStringToNumber(toTokenAmount) * toTokenPriceInUSD}
              style={styles.tokenInput}
              loading={loadingTokens}
              loadingValues={actionLoading}
              onChange={onToTokenChange}
              onTokenPress={() => setShowModal('toToken')}
              editable={false}
            />
            {showSwitch && (
              <IconLink
                icon="recycleHorizontal"
                size="lg"
                iconColor="fg-275"
                background
                backgroundColor="bg-175"
                pressedColor="bg-250"
                style={[styles.arrowIcon, { borderColor: Theme['bg-100'] }]}
                onPress={onSwitchPress}
              />
            )}
          </FlexView>
          {showDetails && <SwapDetails />}
          <Button
            style={styles.actionButton}
            loading={actionLoading}
            disabled={actionState.disabled || actionLoading}
            onPress={onReviewPress}
          >
            {actionState.text}
          </Button>
        </FlexView>
      </ScrollView>
      <Modal
        isVisible={!!showModal}
        useNativeDriver
        useNativeDriverForBackdrop
        onBackdropPress={onModalClose}
        onDismiss={onModalClose}
        style={styles.modal}
      >
        <SwapSelectTokenView onClose={onModalClose} type={showModal} />
      </Modal>
    </>
  );
}
