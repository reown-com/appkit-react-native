import { InputText, InputTextProps } from '../wui-input-text';
import styles from './styles';

export interface InputNumericProps {
  disabled?: boolean;
  onChangeText?: InputTextProps['onChangeText'];
  onSubmitEditing?: InputTextProps['onSubmitEditing'];
  style?: InputTextProps['inputStyle'];
}

export function InputNumeric({
  disabled,
  onChangeText,
  onSubmitEditing,
  style
}: InputNumericProps) {
  return (
    <InputText
      disabled={disabled}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      keyboardType="number-pad"
      returnKeyType="done"
      size="xs"
      textAlign="center"
      inputStyle={[styles.input, style]}
      maxLength={1}
    />
  );
}
