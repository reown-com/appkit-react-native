import { useSnapshot } from 'valtio';
import { useState } from 'react';

import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  EventsController,
  type W3mFrameProvider
} from '@web3modal/core-react-native';

import { OtpCodeView } from '../../partials/w3m-otp-code';

export function UpdateEmailSecondaryOtpView() {
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailConnector = ConnectorController.getEmailConnector();

  const onOtpSubmit = async (value: string) => {
    if (!emailConnector) return;
    setLoading(true);
    setError('');
    try {
      const provider = emailConnector?.provider as W3mFrameProvider;
      await provider.updateEmailSecondaryOtp({ otp: value });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_EDIT_COMPLETE' });
      RouterController.reset('Account');
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
      retryDisabledLabel="Try again"
      retryLabel="Try again"
    />
  );
}
