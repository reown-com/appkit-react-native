import { useSnapshot } from 'valtio';
import { useState, useEffect } from 'react';
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
import useTimeout from '../../hooks/useTimeout';
import { OtpCodeView } from '../../partials/w3m-otp-code';

export function EmailVerifyOtpView() {
  const { timeLeft, startTimer } = useTimeout(0);
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailConnector = ConnectorController.getEmailConnector();

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

  const onOtpSubmit = async (otp: string) => {
    if (!emailConnector) return;
    setLoading(true);
    setError('');
    try {
      const provider = emailConnector?.provider as W3mFrameProvider;
      await provider.connectOtp({ otp });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
      await ConnectionController.connectExternal(emailConnector);
      ModalController.close();
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: { method: 'email', name: emailConnector.name || 'Unknown' }
      });
    } catch (e) {
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' });
      const parsedError = CoreHelperUtil.parseError(e);
      if (parsedError?.includes('Invalid code')) {
        setError('Invalid code. Try again.');
      } else {
        SnackController.showError(parsedError);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    startTimer(30);
  }, [startTimer]);

  return (
    <OtpCodeView
      loading={loading}
      error={error}
      timeLeft={timeLeft}
      email={data?.email}
      onRetry={onOtpResend}
      onSubmit={onOtpSubmit}
    />
  );
}
