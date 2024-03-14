import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { EmailInput, FlexView } from '@web3modal/ui-react-native';
import { ConnectorController, RouterController } from '@web3modal/core-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';

export function ConnectEmailInput() {
  const { connectors } = useSnapshot(ConnectorController.state);
  const [loading, setLoading] = useState(false);
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  const onEmailSubmit = async (email: string) => {
    if (email.length === 0) return;

    setLoading(true);
    const response = await emailProvider.connectEmail({ email });
    if (response.action === 'VERIFY_DEVICE') {
      RouterController.push('EmailVerifyDevice', { email });
    } else if (response.action === 'VERIFY_OTP') {
      RouterController.push('EmailVerifyOtp', { email });
    }
    setLoading(false);
  };

  return (
    <FlexView justifyContent="center" margin={['0', '0', 's', '0']}>
      <EmailInput onSubmit={onEmailSubmit} loading={loading} />
    </FlexView>
  );
}
