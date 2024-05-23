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
    } else if (text.length === length) {
      // Paste OTP
      newValue = text.split('');
      focusInputField('next', length - 1);
    } else if (text.length === 2) {
      // Replace value
      newValue = [
        ...value.slice(0, index),
        (value[index] === text[0] ? text[1] : text[0]) ?? '',
        ...value.slice(index + 1)
      ];
    } else {
      newValue = [...value.slice(0, index), text[0] || '', ...value.slice(index + 1)];
      focusInputField('next', index);
    }

    setValue(newValue);
    onChangeText?.(newValue.join(''));
  };

  const focusInputField = (dir: 'prev' | 'next', currentIndex: number, clear = false) => {
    let newIndex;
    if (dir === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (dir === 'next' && currentIndex < length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== undefined) {
      refArray[newIndex]?.current?.focus();
      if (clear) {
        refArray[newIndex]?.current?.clear();
        _onChangeText('', newIndex);
      }
    }
  };

  const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const currentValue = value[index] || '';
    const key = e.nativeEvent.key;

    if (key === 'Backspace') {
      if (!currentValue) {
        focusInputField('prev', index, true);
      }
    } else {
      focusInputField('next', index);
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
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        />
      ))}
    </View>
  );
}
