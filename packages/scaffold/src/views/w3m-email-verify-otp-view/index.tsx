import { useSnapshot } from 'valtio';
import { useState, useEffect, useCallback } from 'react';
import { FlexView, LoadingSpinner, Otp, Text } from '@web3modal/ui-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  RouterController
} from '@web3modal/core-react-native';
import styles from './styles';

export function EmailVerifyOtpView() {
  const [otp, setOtp] = useState<string>('');
  const { connectors } = useSnapshot(ConnectorController.state);
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState<boolean>(false);
  const emailConnector = connectors.find(c => c.type === 'EMAIL');

  const onOtpSubmit = useCallback(async () => {
    if (!emailConnector) return;

    setLoading(true);
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
    } catch (error) {
      //TODO: Add error handling
      console.error('OTP verification failed', error);
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
      <FlexView justifyContent="center" alignItems="center" style={styles.otpContainer}>
        {loading ? <LoadingSpinner /> : <Otp length={6} onChangeText={setOtp} />}
      </FlexView>
    </FlexView>
  );
}
