import { useRef, useState } from 'react';
import { TextInput, type StyleProp, type ViewStyle } from 'react-native';
import {
  FlexView,
  Link,
  Text,
  useTheme,
  TokenButton,
  Shimmer
} from '@reown/appkit-ui-react-native';
import { NumberUtil, type Balance } from '@reown/appkit-common-react-native';
import { SendController } from '@reown/appkit-core-react-native';

import { getMaxAmount, getSendValue } from './utils';
import styles from './styles';

export interface SendInputTokenProps {
  token?: Balance;
  sendTokenAmount?: number;
  style?: StyleProp<ViewStyle>;
  onTokenPress?: () => void;
  loading?: boolean;
}

export function SendInputToken({
  token,
  sendTokenAmount,
  style,
  onTokenPress,
  loading
}: SendInputTokenProps) {
  const Theme = useTheme();
  const valueInputRef = useRef<TextInput | null>(null);
  const [inputValue, setInputValue] = useState<string | undefined>(sendTokenAmount?.toString());
  const sendValue = getSendValue(token, sendTokenAmount);
  const maxAmount = getMaxAmount(token);
  const maxError = token && sendTokenAmount && sendTokenAmount > Number(token?.quantity?.numeric);

  const onInputChange = (value: string) => {
    const formattedValue = value.replace(/,/g, '.');

    if (Number(formattedValue) >= 0 || formattedValue === '') {
      setInputValue(formattedValue);
      SendController.setTokenAmount(Number(formattedValue));
    }
  };

  const onMaxPress = () => {
    if (token?.quantity?.numeric) {
      const maxValue = NumberUtil.bigNumber(token.quantity.numeric);
      SendController.setTokenAmount(Number(maxValue.toFixed(20)));
      setInputValue(maxValue.toFixed(20));
      valueInputRef.current?.blur();
    }
  };

  return loading ? (
    <Shimmer width="100%" height={100} borderRadius={16} style={styles.inputLoading} />
  ) : (
    <FlexView
      style={[
        styles.container,
        { backgroundColor: Theme['gray-glass-005'], borderColor: Theme['gray-glass-005'] },
        style
      ]}
      justifyContent="center"
      padding={['xl', 'l', 'l', 'l']}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        <TextInput
          ref={valueInputRef}
          placeholder="0"
          placeholderTextColor={Theme['fg-275']}
          returnKeyType="done"
          style={[styles.input, { color: Theme['fg-100'] }]}
          autoCapitalize="none"
          autoCorrect={false}
          value={inputValue}
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
        <TokenButton
          imageUrl={token?.iconUrl}
          text={token?.symbol}
          onPress={onTokenPress}
          chevron
        />
      </FlexView>
      {token ? <FlexView
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          margin={['3xs', '0', '0', '0']}
        >
          <Text variant="small-400" color="fg-200" style={styles.sendValue} numberOfLines={1}>
            {sendValue ?? ''}
          </Text>
          <FlexView flexDirection="row" alignItems="center" justifyContent="center">
            <Text variant="small-400" color={maxError ? 'error-100' : 'fg-200'} numberOfLines={1}>
              {maxAmount ?? ''}
            </Text>
            <Link onPress={onMaxPress}>Max</Link>
          </FlexView>
        </FlexView> : null}
    </FlexView>
  );
}
