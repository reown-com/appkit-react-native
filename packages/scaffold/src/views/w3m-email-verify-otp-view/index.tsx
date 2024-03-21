import { useSnapshot } from 'valtio';
import { useState, useEffect, useCallback } from 'react';
import { FlexView, Link, LoadingSpinner, Otp, Text } from '@web3modal/ui-react-native';
import { W3mFrameHelpers, type W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
import styles from './styles';
import useTimeout from '../../hooks/useTimeout';

export function EmailVerifyOtpView() {
  const [otp, setOtp] = useState<string>('');
  const { timeLeft, startTimer } = useTimeout(0);
  const { connectors } = useSnapshot(ConnectorController.state);
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const emailConnector = connectors.find(c => c.type === 'EMAIL');

  const onOtpResend = async () => {
    try {
      if (!data?.email || !emailConnector) return;
      setLoading(true);
      const provider = emailConnector?.provider as W3mFrameProvider;
      await provider.connectEmail({ email: data.email });
      SnackController.showSuccess('Code sent');
      const timer = await W3mFrameHelpers.getTimeToNextEmailLogin();
      startTimer(timer);
      setLoading(false);
    } catch (e) {
      const parsedError = CoreHelperUtil.parseError(e);
      SnackController.showError(parsedError);
      setLoading(false);
    }
  };

  const onOtpSubmit = useCallback(async () => {
    if (!emailConnector) return;
    setLoading(true);
    setError(false);
    try {
      const provider = emailConnector?.provider as W3mFrameProvider;
      await provider.connectOtp({ otp });
      await ConnectionController.connectExternal(emailConnector);
      ModalController.close();
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: { method: 'email', name: emailConnector.name || 'Unknown' }
      });
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [otp, emailConnector]);

  useEffect(() => {
    if (otp.length === 6) {
      onOtpSubmit();
    }
  }, [onOtpSubmit, otp]);

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
      <Text center variant="paragraph-500">
        Enter the code we sent to your email{' '}
        <Text variant="paragraph-600" style={styles.emailText}>
          {data?.email ?? 'your email'}
        </Text>
      </Text>
      <Text style={styles.expiryText} variant="small-400" color="fg-200">
        The code expires in 20 minutes
      </Text>
      <FlexView justifyContent="center" style={styles.otpContainer}>
        {loading ? <LoadingSpinner /> : <Otp length={6} onChangeText={setOtp} />}
      </FlexView>
      {error && (
        <Text variant="small-400" color="error-100" style={styles.errorText}>
          Invalid code. Try Again
        </Text>
      )}
      <FlexView alignItems="center" flexDirection="row" margin="3xs">
        <Text variant="small-400" color="fg-200">
          Didn't receive it?
        </Text>
        <Link onPress={onOtpResend} disabled={timeLeft > 0 || loading}>
          {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend code'}
        </Link>
      </FlexView>
    </FlexView>
  );
}
