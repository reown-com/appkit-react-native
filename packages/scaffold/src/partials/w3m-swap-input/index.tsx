import { useRef } from 'react';
import { TextInput, type StyleProp, type ViewStyle } from 'react-native';
import { FlexView, useTheme, TokenButton, Shimmer } from '@reown/appkit-ui-react-native';
import { type SwapToken } from '@reown/appkit-core-react-native';

import styles from './styles';

export interface SwapInputProps {
  token?: SwapToken;
  value?: string;
  gasPrice?: number;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  onTokenPress?: () => void;
  onChange?: (value: string) => void;
}

export function SwapInput({
  token,
  value,
  style,
  loading,
  onTokenPress,
  onChange
}: SwapInputProps) {
  const Theme = useTheme();
  const valueInputRef = useRef<TextInput | null>(null);
  // const [inputValue, setInputValue] = useState<string | undefined>(value?.toString());
  // const sendValue = getSendValue(token, sendTokenAmount);
  // const maxAmount = getMaxAmount(token);
  // const maxError = token && sendTokenAmount && sendTokenAmount > Number(token.quantity.numeric);

  const onInputChange = (_value: string) => {
    onChange?.(_value);
  };

  // const onMaxPress = () => {
  //   //
  // };

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
          <Shimmer height={36} width={80} borderRadius={12} />
          <Shimmer height={36} width={80} borderRadius={18} />
        </FlexView>
      ) : (
        <>
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            <TextInput
              ref={valueInputRef}
              placeholder="0"
              placeholderTextColor={Theme['fg-275']}
              returnKeyType="done"
              style={[styles.input, { color: Theme['fg-100'] }]}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onInputChange}
              keyboardType="decimal-pad"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              selectionColor={Theme['accent-100']}
              underlineColorAndroid="transparent"
              selectTextOnFocus={false}
              numberOfLines={1}
              autoFocus={!!token}
            />
            <TokenButton symbol={token?.symbol} imageUrl={token?.logoUri} onPress={onTokenPress} />
          </FlexView>
          {/* {token && (
            <FlexView
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              margin={['3xs', '0', '0', '0']}
            >
              <Text variant="small-400" color="fg-200" style={styles.sendValue} numberOfLines={1}>
                {sendValue ?? ''}
              </Text>
              <FlexView flexDirection="row" alignItems="center" justifyContent="center">
                <Text
                  variant="small-400"
                  color={maxError ? 'error-100' : 'fg-200'}
                  numberOfLines={1}
                >
                  {maxAmount ?? ''}
                </Text>
                <Link onPress={onMaxPress}>Max</Link>
              </FlexView>
            </FlexView>
          )} */}
        </>
      )}
    </FlexView>
  );
}
