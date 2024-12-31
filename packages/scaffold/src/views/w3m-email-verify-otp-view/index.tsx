import { useState } from 'react';
import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import useTimeout from '../../hooks/useTimeout';
import { OtpCodeView } from '../../partials/w3m-otp-code';
import type { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';

export function EmailVerifyOtpView() {
  const { timeLeft, startTimer } = useTimeout(0);
  const { data } = RouterController.state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authConnector = ConnectorController.getAuthConnector();

  const onOtpResend = async () => {
    try {
      if (!data?.email || !authConnector) return;
      setLoading(true);
      const provider = authConnector?.provider as AppKitFrameProvider;
      await provider.connectEmail({ email: data.email });
      SnackController.showSuccess('Code resent');
      startTimer(30);
      setLoading(false);
    } catch (e) {
      const parsedError = CoreHelperUtil.parseError(e);
      SnackController.showError(parsedError);
      setLoading(false);
    }
  };

  const onOtpSubmit = async (otp: string) => {
    if (!authConnector) return;
    setLoading(true);
    setError('');
    try {
      const provider = authConnector?.provider as AppKitFrameProvider;
      await provider.connectOtp({ otp });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
      await ConnectionController.connectExternal(authConnector, authConnector.chain);
      ModalController.close();
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: { method: 'email', name: authConnector.name || 'Unknown' }
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
