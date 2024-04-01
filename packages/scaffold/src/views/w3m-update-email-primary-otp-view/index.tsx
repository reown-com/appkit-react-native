import { useSnapshot } from 'valtio';
import { useState, useEffect } from 'react';
import { type W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';

import useTimeout from '../../hooks/useTimeout';
import { OtpCodeView } from '../../partials/w3m-otp-code';

export function UpdateEmailPrimaryOtpView() {
  const { timeLeft, startTimer } = useTimeout(0);
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
      RouterController.replace('UpdateEmailSecondaryOtp', data);
    } catch (e) {
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
      email={emailProvider?.getEmail()}
      onSubmit={onOtpSubmit}
      onRetry={RouterController.goBack}
      codeExpiry={10}
      timeLeft={timeLeft}
      retryDisabledLabel="Try again"
      retryLabel="Try again"
    />
  );
}
