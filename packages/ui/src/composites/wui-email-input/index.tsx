import { useState } from 'react';
import { Text } from '../../components/wui-text';
import { InputText, type InputTextProps } from '../wui-input-text';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import { IconLink } from '../wui-icon-link';
import styles from './styles';

export type EmailInputProps = InputTextProps & {
  errorMessage?: string;
  loading?: boolean;
  onSubmit?: (value: string) => any;
};

function RightIcon({
  loading,
  showChevron,
  onPress
}: {
  loading?: boolean;
  showChevron: boolean;
  onPress?: () => void;
}) {
  if (loading) {
    return <LoadingSpinner size="md" color="accent-100" style={styles.spinner} />;
  }

  if (showChevron) {
    return <IconLink icon="chevronRight" onPress={onPress} size="sm" iconColor="accent-100" />;
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
  const [showChevron, setShowChevron] = useState(false);
  const [email, setEmail] = useState('');

  const onChevronPress = () => {
    onSubmit?.(email);
  };

  const handleSubmitEditing = ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
    onSubmit?.(text);
  };

  const handleChangeText = (text: string) => {
    setShowChevron(text.length > 0);
    setEmail(text);
    onChangeText?.(text);
  };

  return (
    <>
      <InputText
        icon="mail"
        placeholder="Email"
        size="md"
        onSubmitEditing={handleSubmitEditing}
        onChangeText={handleChangeText}
        keyboardType="email-address"
        returnKeyType="go"
        enablesReturnKeyAutomatically
        disabled={disabled || loading}
        value={email}
        {...rest}
      >
        <RightIcon loading={loading} showChevron={showChevron} onPress={onChevronPress} />
      </InputText>
      <Text color="error-100" variant="tiny-500" style={styles.text}>
        {errorMessage}
      </Text>
    </>
  );
}
