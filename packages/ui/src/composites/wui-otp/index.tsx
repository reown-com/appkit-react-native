import { createRef, useMemo, useState } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
  View,
  Platform
} from 'react-native';
import { InputNumeric, type InputNumericProps } from '../wui-input-numeric';
import styles from './styles';

export interface OtpProps {
  length: number;
  style?: InputNumericProps['style'];
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
}

export function Otp({ length, style, onChangeText, autoFocus }: OtpProps) {
  const [value, setValue] = useState<string[]>([]);

  const refArray = useMemo(
    () => Array.from({ length }).map(() => createRef<TextInput>()),
    [length]
  );

  const _onChangeText = (text: string, index: number) => {
    let newValue = [...value];

    if (text.length <= 1) {
      newValue = [...value.slice(0, index), text, ...value.slice(index + 1)];
    } else {
      newValue = text.split('', length);
    }

    setValue(newValue);
    onChangeText?.(newValue.join(''));

    if (text.length === 1 && index < length - 1) {
      refArray[index + 1]?.current?.focus();
    } else if (text.length > 1) {
      refArray[newValue.length]?.current?.focus();
    }
  };

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const currentValue = value[index] || '';

    if (e.nativeEvent.key !== 'Backspace' && currentValue && index !== length - 1) {
      refArray[index + 1]?.current?.focus();

      return;
    }

    if (e.nativeEvent.key === 'Backspace' && index !== 0) {
      if (!currentValue) {
        refArray[index - 1]?.current?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <InputNumeric
          autoFocus={autoFocus && index === 0}
          key={index}
          style={style}
          value={value[index] || ''}
          inputRef={refArray[index]}
          onChangeText={text => _onChangeText(text, index)}
          onKeyPress={(e: any) => onKeyPress(e, index)}
          selectTextOnFocus
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        />
      ))}
    </View>
  );
}
