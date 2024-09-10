import { useSnapshot } from 'valtio';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { FlexView, Icon, Link, Text, useTheme } from '@reown/ui-react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type AppKitFrameProvider
} from '@reown/core-react-native';
import useTimeout from '../../hooks/useTimeout';
import styles from './styles';

export function EmailVerifyDeviceView() {
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { data } = useSnapshot(RouterController.state);
  const { timeLeft, startTimer } = useTimeout(0);
  const [loading, setLoading] = useState(false);
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as AppKitFrameProvider;

  const listenForDeviceApproval = async () => {
    if (emailProvider && data?.email) {
      try {
        await emailProvider.connectDevice();
        EventsController.sendEvent({ type: 'track', event: 'DEVICE_REGISTERED_FOR_EMAIL' });
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' });
        RouterController.replace('EmailVerifyOtp', { email: data.email });
      } catch (error: any) {
        RouterController.goBack();
      }
    }
  };

  const onResendEmail = async () => {
    try {
      if (!data?.email || !emailProvider) return;
      setLoading(true);
      emailProvider?.connectEmail({ email: data.email });
      listenForDeviceApproval();
      SnackController.showSuccess('Link resent');
      startTimer(30);
      setLoading(false);
    } catch (e) {
      const parsedError = CoreHelperUtil.parseError(e);
      SnackController.showError(parsedError);
    }
  };

  useEffect(() => {
    listenForDeviceApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlexView alignItems="center" padding={['0', '4xl', '3xl', '4xl']}>
      <View style={[styles.iconContainer, { backgroundColor: Theme['accent-glass-010'] }]}>
        <Icon name="verify" size="lg" height={28} width={28} color="accent-100" />
      </View>
      <Text center variant="medium-600" style={styles.headingText}>
        Register this device to continue
      </Text>
      <Text center variant="paragraph-400">
        Check the instructions sent to{' '}
      </Text>
      <Text variant="paragraph-500">{data?.email ?? 'your email'}</Text>
      <Text variant="small-400" color="fg-200" style={styles.expiryText}>
        The link expires in 20 minutes
      </Text>
      <FlexView alignItems="center" justifyContent="center" flexDirection="row">
        <Text variant="small-400">Didn't receive it?</Text>
        <Link onPress={onResendEmail} disabled={timeLeft > 0 || loading}>
          {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend link'}
        </Link>
      </FlexView>
    </FlexView>
  );
}
