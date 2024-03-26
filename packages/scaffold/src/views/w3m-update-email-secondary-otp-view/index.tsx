import { useSnapshot } from 'valtio';
import { useState, useEffect } from 'react';
import { type W3mFrameProvider } from '@web3modal/email-react-native';
import { ConnectorController, RouterController } from '@web3modal/core-react-native';

import useTimeout from '../../hooks/useTimeout';
import { OtpCodeView } from '../../partials/w3m-otp-code';

export function UpdateEmailSecondaryOtpView() {
  const { timeLeft, startTimer } = useTimeout(0);
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const emailConnector = ConnectorController.getEmailConnector();

  const onOtpSubmit = async (value: string) => {
    if (!emailConnector) return;
    setLoading(true);
    setError(false);
    try {
      const provider = emailConnector?.provider as W3mFrameProvider;
      await provider.updateEmailSecondaryOtp({ otp: value });
      RouterController.reset('Account');
    } catch {
      setError(true);
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
      onSubmit={onOtpSubmit}
      onRetry={RouterController.goBack}
      codeExpiry={10}
      retryDisabledLabel="Try again"
      retryLabel="Try again"
    />
  );
}
