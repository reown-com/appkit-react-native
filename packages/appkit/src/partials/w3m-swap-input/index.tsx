import { useRef } from 'react';
import type BigNumber from 'bignumber.js';
import { TextInput, type StyleProp, type ViewStyle } from 'react-native';
import {
  FlexView,
  useTheme,
  TokenButton,
  Shimmer,
  Text,
  UiUtil,
  Link
} from '@reown/appkit-ui-react-native';
import { type SwapTokenWithBalance } from '@reown/appkit-core-react-native';

import styles from './styles';
import { NumberUtil } from '@reown/appkit-common-react-native';

export interface SwapInputProps {
  token?: SwapTokenWithBalance;
  value?: string;
  gasPrice?: number;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  loadingValues?: boolean;
  onTokenPress?: () => void;
  onMaxPress?: () => void;
  onChange?: (value: string) => void;
  balance?: BigNumber;
  marketValue?: number;
  editable?: boolean;
  autoFocus?: boolean;
}

const MINIMUM_USD_VALUE_TO_CONVERT = 0.00005;

export function SwapInput({
  token,
  value,
  style,
  loading,
  loadingValues,
  onTokenPress,
  onMaxPress,
  onChange,
  marketValue,
  editable,
  autoFocus
}: SwapInputProps) {
  const Theme = useTheme();
  const valueInputRef = useRef<TextInput | null>(null);
  const isMarketValueGreaterThanZero =
    !!marketValue && NumberUtil.bigNumber(marketValue).isGreaterThan('0');
  const maxAmount = UiUtil.formatNumberToLocalString(token?.quantity?.numeric, 3);
  const maxError = Number(value) > Number(token?.quantity?.numeric);
  const showMax =
    onMaxPress &&
    !!token?.quantity?.numeric &&
    NumberUtil.multiply(token?.quantity.numeric, token?.price).isGreaterThan(
      MINIMUM_USD_VALUE_TO_CONVERT
    );

  const handleInputChange = (_value: string) => {
    const formattedValue = _value.replace(/,/g, '.');

    if (Number(formattedValue) >= 0 || formattedValue === '') {
      onChange?.(formattedValue);
    }
  };

  const handleMaxPress = () => {
    if (valueInputRef.current) {
      valueInputRef.current.blur();
    }

    onMaxPress?.();
  };

  return (
    <FlexView
      style={[
        styles.container,
        { backgroundColor: Theme['gray-glass-005'], borderColor: Theme['gray-glass-005'] },
        style
      ]}
      justifyContent="center"
      padding={['xl', 'l', 'l', 'l']}
    >
      {loading ? (
        <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
          <FlexView alignItems="flex-start">
            <Shimmer height={36} width={80} borderRadius={12} style={styles.valueLoader} />
            <Shimmer height={20} width={120} borderRadius={8} />
          </FlexView>
          <Shimmer height={36} width={80} borderRadius={18} />
        </FlexView>
      ) : (
        <>
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            {loadingValues ? (
              <Shimmer height={36} width={80} borderRadius={12} style={styles.valueLoader} />
            ) : (
              <TextInput
                ref={valueInputRef}
                placeholder="0"
                placeholderTextColor={Theme['fg-275']}
                returnKeyType="done"
                style={[styles.input, { color: Theme['fg-100'] }]}
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={handleInputChange}
                keyboardType="decimal-pad"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                selectionColor={Theme['accent-100']}
                underlineColorAndroid="transparent"
                selectTextOnFocus={false}
                numberOfLines={1}
                editable={editable}
                autoFocus={autoFocus}
              />
            )}
            <TokenButton
              text={token?.symbol}
              imageUrl={token?.logoUri}
              onPress={onTokenPress}
              chevron
            />
          </FlexView>
          {loadingValues ? (
            <Shimmer height={20} width={120} borderRadius={8} />
          ) : showMax || isMarketValueGreaterThanZero ? (
            <FlexView
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              margin={['3xs', '0', '0', '0']}
            >
              <Text variant="small-400" color="fg-200" numberOfLines={1}>
                {isMarketValueGreaterThanZero
                  ? `~$${UiUtil.formatNumberToLocalString(marketValue, 6)}`
                  : ''}
              </Text>
              {showMax && (
                <FlexView flexDirection="row" alignItems="center" justifyContent="center">
                  <Text
                    variant="small-400"
                    color={maxError ? 'error-100' : 'fg-200'}
                    numberOfLines={1}
                  >
                    {showMax ? maxAmount : ''}
                  </Text>
                  <Link onPress={handleMaxPress}>Max</Link>
                </FlexView>
              )}
            </FlexView>
          ) : null}
        </>
      )}
    </FlexView>
  );
}
