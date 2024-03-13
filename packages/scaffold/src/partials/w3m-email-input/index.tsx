import { useSnapshot } from 'valtio';
import { EmailInput, FlexView, Text } from '@web3modal/ui-react-native';
import { ConnectorController } from '@web3modal/core-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';
import { useState } from 'react';

export function EmailInputView() {
  const { connectors } = useSnapshot(ConnectorController.state);
  const [loading, setLoading] = useState(false);
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  const onEmailSubmit = async (email: string) => {
    if (email.length === 0) return;

    setLoading(true);
    const response = await emailProvider.connectEmail({ email });
    if (response.action === 'VERIFY_DEVICE') {
      console.log('Device verification required');
    } else if (response.action === 'VERIFY_OTP') {
      console.log('OTP verification required');
    }
    setLoading(false);
  };

  return (
    <FlexView justifyContent="center" margin={['0', '0', 's', '0']}>
      <EmailInput onSubmit={onEmailSubmit} loading={loading} />
      <Text center variant="small-400" color="fg-250">
        or
      </Text>
    </FlexView>
  );
}
