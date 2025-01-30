import { useRef, useState } from 'react';
import { StyleSheet, TextInput, type StyleProp, type ViewStyle } from 'react-native';
import {
  FlexView,
  useTheme,
  TokenButton,
  BorderRadius,
  Spacing,
  Text,
  Shimmer
} from '@reown/appkit-ui-react-native';

export interface InputTokenProps {
  title?: string;
  tokenImage?: string;
  tokenSymbol?: string;
  style?: StyleProp<ViewStyle>;
  onTokenPress?: () => void;
  initialValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  value?: string;
  loading?: boolean;
  error?: string;
  containerHeight?: number;
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function InputToken({
  tokenImage,
  tokenSymbol,
  style,
  containerHeight = 100,
  title,
  onTokenPress,
  initialValue,
  value,
  onInputChange,
  placeholder = 'Select currency',
  editable = true,
  loading,
  error
}: InputTokenProps) {
  const Theme = useTheme();
  const valueInputRef = useRef<TextInput | null>(null);
  const [inputValue, setInputValue] = useState<string | undefined>(initialValue);

  const debouncedOnChange = useRef(
    debounce((_value: string) => {
      onInputChange?.(_value);
    }, 500)
  ).current;

  const handleInputChange = (_value: string) => {
    const formattedValue = _value.replace(/,/g, '.');

    if (Number(formattedValue) >= 0 || formattedValue === '') {
      setInputValue(formattedValue);
      debouncedOnChange(formattedValue);
    }
  };

  return loading ? (
    <Shimmer
      height={containerHeight}
      width="100%"
      borderRadius={BorderRadius.xs}
      style={[styles.container, style]}
    />
  ) : (
    <FlexView
      style={[
        styles.container,
        {
          backgroundColor: Theme['gray-glass-005'],
          borderColor: Theme['gray-glass-005'],
          height: containerHeight
        },
        style
      ]}
      justifyContent="center"
      padding={['xl', 'l', 'l', 'l']}
    >
      {title && (
        <Text variant="small-500" color="fg-175">
          {title}
        </Text>
      )}
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        {editable ? (
          <TextInput
            ref={valueInputRef}
            placeholder={editable ? '0' : ''}
            editable={editable}
            placeholderTextColor={Theme['fg-275']}
            returnKeyType="done"
            style={[styles.input, { color: Theme['fg-100'] }]}
            autoCapitalize="none"
            autoCorrect={false}
            value={value || inputValue}
            onChangeText={handleInputChange}
            keyboardType="decimal-pad"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            selectionColor={Theme['accent-100']}
            underlineColorAndroid="transparent"
            selectTextOnFocus={false}
            numberOfLines={1}
            autoFocus
          />
        ) : (
          <Text numberOfLines={1} variant="medium-title-500" color="fg-100">
            {value || inputValue}
          </Text>
        )}
        <TokenButton
          placeholder={placeholder}
          imageUrl={tokenImage}
          text={tokenSymbol}
          onPress={onTokenPress}
        />
      </FlexView>
      {error && (
        <Text variant="small-500" color="error-100" numberOfLines={1} style={styles.error}>
          {error}
        </Text>
      )}
    </FlexView>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BorderRadius.s,
    borderWidth: StyleSheet.hairlineWidth
  },
  input: {
    fontSize: 32,
    flex: 1,
    marginRight: Spacing.xs
  },
  sendValue: {
    flex: 1,
    marginRight: Spacing.xs
  },
  error: {
    marginTop: Spacing['3xs']
  }
});
