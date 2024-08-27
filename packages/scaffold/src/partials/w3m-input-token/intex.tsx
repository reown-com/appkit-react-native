import { TextInput, type StyleProp, type ViewStyle } from 'react-native';
import { FlexView, Link, Text, useTheme } from '@web3modal/ui-react-native';
import { NumberUtil, type Balance } from '@web3modal/common-react-native';
import styles from './styles';

import { SendController } from '@web3modal/core-react-native';
import { getMaxAmount, getSendValue } from './utils';

export interface InputTokenProps {
  token?: Balance;
  sendTokenAmount?: number;
  gasPriceInUSD?: number;
  style?: StyleProp<ViewStyle>;
}

export function InputToken({ token, sendTokenAmount, gasPriceInUSD, style }: InputTokenProps) {
  const Theme = useTheme();
  const sendValue = getSendValue(token, sendTokenAmount);
  const maxAmount = getMaxAmount(token);
  const maxError = token && sendTokenAmount && sendTokenAmount > Number(token.quantity.numeric);

  const onInputChange = (value: string) => {
    const formattedValue = value.replace(/,/g, '.');
    Number(formattedValue)
      ? SendController.setTokenAmount(Number(formattedValue))
      : SendController.setTokenAmount(undefined);
  };

  const onMaxPress = () => {
    if (token && gasPriceInUSD) {
      const amountOfTokenGasRequires = NumberUtil.bigNumber(gasPriceInUSD.toFixed(5)).dividedBy(
        token.price
      );

      const isNetworkToken = token.address === undefined;

      const maxValue = isNetworkToken
        ? NumberUtil.bigNumber(token.quantity.numeric).minus(amountOfTokenGasRequires)
        : NumberUtil.bigNumber(token.quantity.numeric);

      SendController.setTokenAmount(Number(maxValue.toFixed(20)));
    }
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
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        <TextInput
          placeholder="0"
          placeholderTextColor={Theme['fg-275']}
          returnKeyType="done"
          style={[styles.input, { color: Theme['fg-100'] }]}
          autoCapitalize="none"
          autoCorrect={false}
          value={sendTokenAmount?.toLocaleString()}
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
        <Text>ETH</Text>
      </FlexView>
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        <Text variant="small-400" color="fg-200" style={styles.sendValue} numberOfLines={1}>
          {sendValue ?? ''}
        </Text>
        <FlexView flexDirection="row" alignItems="center" justifyContent="center">
          <Text variant="small-400" color={maxError ? 'error-100' : 'fg-200'} numberOfLines={1}>
            {maxAmount ?? '1.204 tst'}
          </Text>
          <Link onPress={onMaxPress}>Max</Link>
        </FlexView>
      </FlexView>
    </FlexView>
  );
}
