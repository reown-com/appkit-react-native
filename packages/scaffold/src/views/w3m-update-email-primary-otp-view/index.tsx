import { useSnapshot } from 'valtio';
import { useState } from 'react';

import {
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type W3mFrameProvider
} from '@reown/core-react-native';

import { OtpCodeView } from '../../partials/w3m-otp-code';

export function UpdateEmailPrimaryOtpView() {
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailProvider = ConnectorController.getEmailConnector()?.provider as
    | W3mFrameProvider
    | undefined;

  const onOtpSubmit = async (value: string) => {
    if (!emailProvider || loading) return;
    setLoading(true);
    setError('');
    try {
      await emailProvider.updateEmailPrimaryOtp({ otp: value });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
      RouterController.replace('UpdateEmailSecondaryOtp', data);
    } catch (e) {
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' });
      const parsedError = CoreHelperUtil.parseError(e);
      if (parsedError?.includes('Invalid Otp')) {
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
      email={data?.email}
      onSubmit={onOtpSubmit}
      onRetry={RouterController.goBack}
      codeExpiry={10}
      retryLabel="Something wrong?"
      retryDisabledButtonLabel="Try again"
      retryButtonLabel="Try again"
    />
  );
}
