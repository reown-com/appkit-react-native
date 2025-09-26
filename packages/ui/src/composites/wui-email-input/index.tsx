import { useState } from 'react';
import { Text } from '../../components/wui-text';
import { InputText, type InputTextProps } from '../wui-input-text';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import { IconLink } from '../wui-icon-link';
import styles from './styles';
import { View } from 'react-native';
import { InputElement } from '../wui-input-element';

export type EmailInputProps = InputTextProps & {
  errorMessage?: string;
  loading?: boolean;
  onSubmit?: (value: string) => any;
  initialValue?: string;
  showClear?: boolean;
  submitEnabled?: boolean;
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
  style,
  initialValue,
  submitEnabled = true,
  ...rest
}: EmailInputProps) {
  const [email, setEmail] = useState(initialValue ?? '');

  const handleSubmit = (value: string) => {
    if (submitEnabled) {
      onSubmit?.(value);
    }
  };

  const handleChevronPress = () => {
    handleSubmit(email);
  };

  const handleSubmitEditing = ({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
    handleSubmit(text);
  };

  const handleChangeText = (text: string) => {
    setEmail(text);
    onChangeText?.(text);
  };

  const rightIconTemplate = () => {
    if (email === initialValue) {
      return (
        <InputElement
          icon="close"
          style={styles.clearButton}
          onPress={() => {
            handleChangeText('');
          }}
        />
      );
    }

    return (
      <RightIcon
        loading={loading}
        showChevron={submitEnabled ? !errorMessage : false}
        onPress={handleChevronPress}
      />
    );
  };

  return (
    <View style={style}>
      <InputText
        icon="email"
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
        {rightIconTemplate()}
      </InputText>
      {errorMessage ? (
        <Text color="error-100" variant="tiny-500" style={styles.text}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
