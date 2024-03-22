import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { EmailInput, Separator, Spacing } from '@web3modal/ui-react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';
import { StyleSheet } from 'react-native';

interface Props {
  isEmailEnabled: boolean;
  showSeparator: boolean;
}

export function ConnectEmailInput({ isEmailEnabled, showSeparator }: Props) {
  const { connectors } = useSnapshot(ConnectorController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  const onChangeText = () => {
    setError('');
  };

  const onEmailSubmit = async (email: string) => {
    try {
      if (email.length === 0) return;

      setLoading(true);
      const response = await emailProvider.connectEmail({ email });
      if (response.action === 'VERIFY_DEVICE') {
        RouterController.push('EmailVerifyDevice', { email });
      } else if (response.action === 'VERIFY_OTP') {
        RouterController.push('EmailVerifyOtp', { email });
      }
    } catch (e: any) {
      const parsedError = CoreHelperUtil.parseError(e);
      if (parsedError?.includes('Invalid email')) {
        setError('Invalid email. Try again.');
      } else {
        SnackController.showError(parsedError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isEmailEnabled) {
    return null;
  }

  return (
    <>
      <EmailInput
        onSubmit={onEmailSubmit}
        loading={loading}
        errorMessage={error}
        onChangeText={onChangeText}
      />
      {showSeparator && <Separator text="or" style={styles.emailSeparator} />}
    </>
  );
}

const styles = StyleSheet.create({
  emailSeparator: {
    marginVertical: Spacing.xs
  }
});
