import { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  Button,
  FlexView,
  useTheme,
  Text,
  LoadingSpinner,
  NumericKeyboard,
  Separator,
  Spacing,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';

export interface InputTokenProps {
  style?: StyleProp<ViewStyle>;
  value?: string;
  symbol?: string;
  loading?: boolean;
  error?: string;
  isAmountError?: boolean;
  purchaseValue?: string;
  onValueChange?: (value: number) => void;
  onSuggestedValuePress?: (value: number) => void;
  suggestedValues?: number[];
}

export function CurrencyInput({
  value,
  loading,
  error,
  isAmountError,
  purchaseValue,
  onValueChange,
  onSuggestedValuePress,
  symbol,
  style,
  suggestedValues
}: InputTokenProps) {
  const Theme = useTheme();
  const [displayValue, setDisplayValue] = useState(value?.toString() || '0');
  const isInternalChange = useRef(false);
  const amountColor = isAmountError ? 'error-100' : value ? 'fg-100' : 'fg-200';

  const decimalSeparator = useMemo(() => {
    return NumberUtil.getLocaleDecimalSeparator();
  }, []);

  const handleKeyPress = (key: string) => {
    isInternalChange.current = true;

    if (key === 'erase') {
      setDisplayValue(prev => {
        const newDisplay = prev.slice(0, -1) || '0';

        // If the previous value does not end with a decimal separator, convert to numeric value
        if (!prev?.endsWith(decimalSeparator)) {
          const numericValue = Number(newDisplay.replace(decimalSeparator, '.'));
          onValueChange?.(numericValue);
        }

        return newDisplay;
      });
    } else if (key === decimalSeparator) {
      setDisplayValue(prev => {
        if (prev.includes(decimalSeparator)) return prev; // Don't add multiple decimal separators
        const newDisplay = prev + decimalSeparator;

        return newDisplay;
      });
    } else {
      setDisplayValue(prev => {
        const newDisplay = prev === '0' ? key : prev + key;

        // Convert to numeric value
        const numericValue = Number(newDisplay.replace(decimalSeparator, '.'));
        onValueChange?.(numericValue);

        return newDisplay;
      });
    }
  };

  useEffect(() => {
    // Handle external value changes
    if (!isInternalChange.current && value !== undefined) {
      setDisplayValue(value.toString());
    }
    isInternalChange.current = false;
  }, [value]);

  return (
    <FlexView style={style} testID="currency-input">
      <FlexView alignItems="center" margin={['m', '0', '0', '0']}>
        <FlexView flexDirection="row" alignItems="center">
          <Text style={[styles.input, { color: Theme[amountColor] }]}>{displayValue}</Text>
          <Text variant="large-400" color={isAmountError ? 'error-100' : 'fg-200'}>
            {symbol || ''}
          </Text>
        </FlexView>
        <FlexView alignItems="center" justifyContent="center" style={styles.bottomContainer}>
          {loading ? (
            <LoadingSpinner size="sm" color="fg-150" />
          ) : error ? (
            <Text
              variant="small-500"
              color="error-100"
              numberOfLines={1}
              testID="currency-input-error"
            >
              {error}
            </Text>
          ) : (
            <Text variant="paragraph-500" color="fg-150" numberOfLines={1}>
              {purchaseValue}
            </Text>
          )}
        </FlexView>
      </FlexView>
      <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', '0', '0']}>
        {suggestedValues?.map((suggestion: number) => {
          const isSelected = suggestion.toString() === value;

          return (
            <Button
              key={suggestion}
              testID={`suggested-value-${suggestion}`}
              style={[
                styles.suggestedValue,
                isSelected && {
                  ...styles.selectedValue,
                  backgroundColor: Theme['accent-glass-020'],
                  borderColor: Theme['accent-100']
                }
              ]}
              variant="shade"
              onPress={() => onSuggestedValuePress?.(suggestion)}
            >
              <Text variant="small-400" color="fg-100">
                {`${suggestion} ${symbol ?? ''}`}
              </Text>
            </Button>
          );
        })}
      </FlexView>
      <Separator color="gray-glass-020" style={styles.separator} />
      <NumericKeyboard onKeyPress={handleKeyPress} />
    </FlexView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 38,
    marginRight: Spacing['3xs']
  },
  bottomContainer: {
    height: 20
  },
  separator: {
    marginTop: 16
  },
  suggestedValue: {
    flex: 1,
    borderRadius: BorderRadius.xxs,
    marginRight: Spacing.xs,
    height: 40
  },
  selectedValue: {
    borderWidth: StyleSheet.hairlineWidth
  }
});
