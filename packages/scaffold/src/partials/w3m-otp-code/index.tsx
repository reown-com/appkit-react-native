import { Platform } from 'react-native';
import { FlexView, Link, LoadingSpinner, Otp, Spacing, Text } from '@web3modal/ui-react-native';

import { useKeyboard } from '../../hooks/useKeyboard';
import styles from './styles';

interface Props {
  onCodeChange?: (code: string) => void;
  onSubmit: (code: string) => void;
  onRetry: () => void;
  loading?: boolean;
  error?: string;
  email?: string;
  timeLeft: number;
  codeExpiry?: number;
  retryDisabledLabel?: string;
  retryLabel?: string;
}

export function OtpCodeView({
  onCodeChange,
  onSubmit,
  onRetry,
  error,
  loading,
  email,
  timeLeft,
  codeExpiry = 20,
  retryDisabledLabel = 'Resend',
  retryLabel = 'Resend code'
}: Props) {
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['3xl'] : Spacing['3xl'],
    default: Spacing['3xl']
  });

  const handleCodeChange = (code: string) => {
    onCodeChange?.(code);

    if (code.length === 6) {
      onSubmit?.(code);
    }
  };

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center" style={{ paddingBottom }}>
      <Text center variant="paragraph-500">
        Enter the code we sent to your email{' '}
        <Text variant="paragraph-600" style={styles.emailText}>
          {email ?? 'your email'}
        </Text>
      </Text>
      <Text style={styles.expiryText} variant="small-400" color="fg-200">
        {`The code expires in ${codeExpiry} minutes`}
      </Text>
      <FlexView justifyContent="center" style={styles.otpContainer}>
        {loading ? <LoadingSpinner /> : <Otp length={6} onChangeText={handleCodeChange} />}
      </FlexView>
      {error && (
        <Text variant="small-400" color="error-100" style={styles.errorText}>
          {error}
        </Text>
      )}
      <FlexView alignItems="center" flexDirection="row" margin="3xs">
        <Text variant="small-400" color="fg-200">
          Didn't receive it?
        </Text>
        <Link onPress={onRetry} disabled={timeLeft > 0 || loading}>
          {timeLeft > 0 ? `${retryDisabledLabel} in ${timeLeft}s` : retryLabel}
        </Link>
      </FlexView>
    </FlexView>
  );
}
