import { createRef, useMemo } from 'react';
import { TextInput, View } from 'react-native';
import { InputNumeric, InputNumericProps } from '../wui-input-numeric';
import styles from './styles';

export interface OtpProps {
  length: number;
  style?: InputNumericProps['style'];
}

export function Otp({ length, style }: OtpProps) {
  const refArray = useMemo(
    () => Array.from({ length }).map(() => createRef<TextInput>()),
    [length]
  );

  const onChangeText = (text: string, index: number) => {
    if (text.length === 1 && index < length - 1) {
      refArray[index + 1].current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <InputNumeric
          key={index}
          style={style}
          inputRef={refArray[index]}
          onChangeText={text => onChangeText(text, index)}
        />
      ))}
    </View>
  );
}
