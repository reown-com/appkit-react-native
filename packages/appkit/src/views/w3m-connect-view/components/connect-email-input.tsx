import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { EmailInput, FlexView } from '@reown/appkit-ui-react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';

interface Props {
  loading?: boolean;
}

export function ConnectEmailInput({ loading }: Props) {
  const { connectors } = useSnapshot(ConnectorController.state);
  const [inputLoading, setInputLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;

  const onChangeText = (value: string) => {
    setIsValidEmail(CoreHelperUtil.isValidEmail(value));
    setError('');
  };

  const onEmailFocus = () => {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_LOGIN_SELECTED' });
  };

  const onEmailSubmit = async (email: string) => {
    try {
      if (email.length === 0) return;

      setInputLoading(true);
      const response = await authProvider.connectEmail({ email });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_SUBMITTED' });
      if (response.action === 'VERIFY_DEVICE') {
        RouterController.push('EmailVerifyDevice', { email });
      } else if (response.action === 'VERIFY_OTP') {
        RouterController.push('EmailVerifyOtp', { email });
      }
    } catch (e: any) {
      const parsedError = CoreHelperUtil.parseError(e);
      if (parsedError?.includes('valid email')) {
        setError('Invalid email. Try again.');
      } else {
        SnackController.showError(parsedError);
      }
    } finally {
      setInputLoading(false);
    }
  };

  return (
    <FlexView padding={['0', 's', '0', 's']}>
      <EmailInput
        onSubmit={onEmailSubmit}
        onFocus={onEmailFocus}
        loading={inputLoading || loading}
        errorMessage={error}
        onChangeText={onChangeText}
        submitEnabled={isValidEmail}
      />
    </FlexView>
  );
}
