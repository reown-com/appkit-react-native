import { TextInput } from 'react-native';
import { InputText, type InputTextProps } from '../wui-input-text';
import styles from './styles';

export interface InputNumericProps extends InputTextProps {
  disabled?: boolean;
  onChangeText?: InputTextProps['onChangeText'];
  onSubmitEditing?: InputTextProps['onSubmitEditing'];
  style?: InputTextProps['inputStyle'];
  inputRef?: React.Ref<TextInput>;
  value?: string;
  onKeyPress?: InputTextProps['onKeyPress'];
}

export function InputNumeric({
  disabled,
  onChangeText,
  onSubmitEditing,
  style,
  inputRef,
  value,
  onKeyPress,
  ...props
}: InputNumericProps) {
  const _onChangeText = (text: string) => {
    const isNumber = /^\d*$/.test(text);
    if (isNumber) {
      onChangeText?.(text);
    }
  };

  return (
    <InputText
      disabled={disabled}
      onChangeText={_onChangeText}
      onSubmitEditing={onSubmitEditing}
      keyboardType="number-pad"
      returnKeyType="done"
      inputMode="numeric"
      size="xs"
      textAlign="center"
      inputStyle={[styles.input, style]}
      ref={inputRef}
      value={value}
      onKeyPress={onKeyPress}
      {...props}
    />
  );
}
