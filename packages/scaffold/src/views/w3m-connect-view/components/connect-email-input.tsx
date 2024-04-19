import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { EmailInput, Separator, Spacing } from '@web3modal/ui-react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type W3mFrameProvider
} from '@web3modal/core-react-native';
import { StyleSheet } from 'react-native';

interface Props {
  isEmailEnabled: boolean;
  showSeparator: boolean;
  loading?: boolean;
}

export function ConnectEmailInput({ isEmailEnabled, showSeparator, loading }: Props) {
  const { connectors } = useSnapshot(ConnectorController.state);
  const [inputLoading, setInputLoading] = useState(false);
  const [error, setError] = useState('');
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  const onChangeText = () => {
    setError('');
  };

  const onEmailFocus = () => {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_LOGIN_SELECTED' });
  };

  const onEmailSubmit = async (email: string) => {
    try {
      if (email.length === 0) return;

      setInputLoading(true);
      const response = await emailProvider.connectEmail({ email });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_SUBMITTED' });
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
      setInputLoading(false);
    }
  };

  if (!isEmailEnabled) {
    return null;
  }

  return (
    <>
      <EmailInput
        onSubmit={onEmailSubmit}
        onFocus={onEmailFocus}
        loading={inputLoading || loading}
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
