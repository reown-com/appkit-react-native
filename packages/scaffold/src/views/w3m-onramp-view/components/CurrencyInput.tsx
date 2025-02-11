import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  FlexView,
  useTheme,
  Text,
  LoadingSpinner,
  NumericKeyboard,
  Separator
} from '@reown/appkit-ui-react-native';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

export interface InputTokenProps {
  style?: StyleProp<ViewStyle>;
  value?: string;
  loading?: boolean;
  error?: string;
  purchaseValue?: string;
  onValueChange?: (value: number) => void;
}

export function CurrencyInput({
  value,
  loading,
  error,
  purchaseValue,
  onValueChange
}: InputTokenProps) {
  const Theme = useTheme();
  const [displayValue, setDisplayValue] = useState(value?.toString() || '0');
  const isInternalChange = useRef(false);

  const handleKeyPress = (key: string) => {
    isInternalChange.current = true;

    if (key === 'erase') {
      setDisplayValue(prev => {
        const newDisplay = prev.slice(0, -1) || '0';

        // If the previous value does not end with a comma, convert to numeric value
        if (!prev?.endsWith(',')) {
          const numericValue = Number(newDisplay.replace(',', '.'));
          onValueChange?.(numericValue);
        }

        return newDisplay;
      });
    } else if (key === ',') {
      setDisplayValue(prev => {
        if (prev.includes(',')) return prev; // Don't add multiple commas
        const newDisplay = prev + ',';

        return newDisplay;
      });
    } else {
      setDisplayValue(prev => {
        const newDisplay = prev === '0' ? key : prev + key;

        // Convert to numeric value
        const numericValue = Number(newDisplay.replace(',', '.'));
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
    <>
      <FlexView alignItems="center" margin={['m', '0', '0', '0']}>
        <Text style={[styles.input, { color: value ? Theme['fg-100'] : Theme['fg-275'] }]}>
          ${displayValue}
        </Text>
        <FlexView alignItems="center" justifyContent="center" style={styles.bottomContainer}>
          {loading ? (
            <LoadingSpinner size="sm" color="fg-150" />
          ) : error ? (
            <Text variant="small-500" color="error-100" numberOfLines={1}>
              {error}
            </Text>
          ) : (
            <Text variant="paragraph-500" color="fg-150" numberOfLines={1}>
              {purchaseValue}
            </Text>
          )}
        </FlexView>
      </FlexView>
      {/* <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', '0', '0']}>
        <Button
          style={{ flex: 1, borderRadius: BorderRadius.xs, marginRight: Spacing.xs }}
          variant="shade"
        >
          $10
        </Button>
        <Button style={{ flex: 1, borderRadius: BorderRadius.xs }} variant="shade">
          $50
        </Button>
        <Button
          style={{ flex: 1, borderRadius: BorderRadius.xs, marginLeft: Spacing.xs }}
          variant="shade"
        >
          $100
        </Button>
      </FlexView> */}
      <Separator color="bg-200" style={styles.separator} />
      <NumericKeyboard onKeyPress={handleKeyPress} />
    </>
  );
}
const styles = StyleSheet.create({
  input: {
    fontSize: 38
  },
  bottomContainer: {
    height: 20
  },
  separator: {
    marginTop: 16
  }
});
