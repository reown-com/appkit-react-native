import { Platform } from 'react-native';
import { FlexView, Link, LoadingSpinner, Otp, Spacing, Text } from '@reown/appkit-ui-react-native';

import { useKeyboard } from '../../hooks/useKeyboard';
import styles from './styles';

interface Props {
  onCodeChange?: (code: string) => void;
  onSubmit: (code: string) => void;
  onRetry: () => void;
  loading?: boolean;
  error?: string;
  email?: string;
  timeLeft?: number;
  codeExpiry?: number;
  retryLabel?: string;
  retryDisabledButtonLabel?: string;
  retryButtonLabel?: string;
}

export function OtpCodeView({
  onCodeChange,
  onSubmit,
  onRetry,
  error,
  loading,
  email,
  timeLeft = 0,
  codeExpiry = 20,
  retryLabel = "Didn't receive it?",
  retryDisabledButtonLabel = 'Resend',
  retryButtonLabel = 'Resend code'
}: Props) {
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const paddingBottom = Platform.select({
    ios: keyboardShown ? keyboardHeight + Spacing.l : Spacing.l,
    default: Spacing.l
  });

  const handleCodeChange = (code: string) => {
    onCodeChange?.(code);

    if (code.length === 6) {
      onSubmit?.(code);
    }
  };

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center" style={{ paddingBottom }}>
      <Text center variant="paragraph-400">
        Enter the code we sent to{' '}
      </Text>
      <Text variant="paragraph-500">{email ?? 'your email'}</Text>
      <Text style={styles.expiryText} variant="small-400" color="fg-200">
        {`The code expires in ${codeExpiry} minutes`}
      </Text>
      <FlexView justifyContent="center" style={styles.otpContainer}>
        {loading ? (
          <LoadingSpinner size="xl" />
        ) : (
          <Otp length={6} onChangeText={handleCodeChange} autoFocus />
        )}
      </FlexView>
      {error && (
        <Text variant="small-400" color="error-100" style={styles.errorText}>
          {error}
        </Text>
      )}
      {!loading && (
        <FlexView alignItems="center" flexDirection="row" margin={['s', '0', '0', '0']}>
          <Text variant="small-400" color="fg-200">
            {retryLabel}
          </Text>
          <Link onPress={onRetry} disabled={timeLeft > 0 || loading}>
            {timeLeft > 0 ? `${retryDisabledButtonLabel} in ${timeLeft}s` : retryButtonLabel}
          </Link>
        </FlexView>
      )}
    </FlexView>
  );
}
