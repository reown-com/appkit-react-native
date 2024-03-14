import { useSnapshot } from 'valtio';
import { View } from 'react-native';
import { FlexView, Icon, Text, useTheme } from '@web3modal/ui-react-native';
import { ConnectorController, RouterController } from '@web3modal/core-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';
import styles from './styles';
import { useEffect } from 'react';

export function EmailVerifyDeviceView() {
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { data } = useSnapshot(RouterController.state);
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  const listenForDeviceApproval = async () => {
    if (emailProvider) {
      try {
        await emailProvider.connectDevice();
        RouterController.replace('EmailVerifyOtp', { email: data.email });
      } catch (error: any) {
        RouterController.goBack();
      }
    }
  };

  useEffect(() => {
    listenForDeviceApproval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlexView alignItems="center" padding={['2xl', '4xl', '3xl', '4xl']}>
      <View style={[styles.iconContainer, { backgroundColor: Theme['accent-glass-020'] }]}>
        <Icon name="verify" size="lg" height={30} width={30} color="accent-100" />
      </View>
      <Text center variant="paragraph-400">
        Approve the login link we sent to{' '}
        <Text variant="paragraph-600" style={styles.emailText}>
          {data?.email ?? 'your email'}
        </Text>
      </Text>
      <Text variant="small-400" color="fg-200" style={styles.expiryText}>
        The code expires in 20 minutes
      </Text>
      <Text variant="small-400">Didn't receive it? Resend email</Text>
    </FlexView>
  );
}
