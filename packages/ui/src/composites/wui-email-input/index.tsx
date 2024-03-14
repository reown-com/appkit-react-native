import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/wui-text';
import { InputText, type InputTextProps } from '../wui-input-text';
import { Icon } from '../../components/wui-icon';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import styles from './styles';

export type EmailInputProps = InputTextProps & {
  errorMessage?: string;
  loading?: boolean;
  onSubmit?: (value: string) => any;
};

function RightIcon({ loading, showChevron }: { loading?: boolean; showChevron: boolean }) {
  if (loading) {
    return <LoadingSpinner size="md" color="accent-100" />;
  }

  if (showChevron) {
    return <Icon name="chevronRight" size="sm" color="accent-100" />;
  }

  return null;
}

export function EmailInput({
  errorMessage,
  onSubmit,
  onChangeText,
  loading,
  disabled,
  ...rest
}: EmailInputProps) {
  const [showChevron, setShowChevron] = useState(false); // TODO: Improve this

  const handleSubmitEditing = ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
    onSubmit?.(text);
  };

  const handleChangeText = (text: string) => {
    setShowChevron(text.length > 0);
    onChangeText?.(text);
  };

  return (
    <View>
      <InputText
        icon="mail"
        placeholder="Email"
        size="md"
        onSubmitEditing={handleSubmitEditing}
        onChangeText={handleChangeText}
        keyboardType="email-address"
        returnKeyType="go"
        disabled={disabled || loading}
        {...rest}
      >
        <RightIcon loading={loading} showChevron={showChevron} />
      </InputText>
      <Text color="error-100" variant="tiny-500" style={styles.text}>
        {errorMessage}
      </Text>
    </View>
  );
}
