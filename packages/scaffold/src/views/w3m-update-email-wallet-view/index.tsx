import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
import { Button, EmailInput, FlexView, Text } from '@web3modal/ui-react-native';
import type { W3mFrameProvider } from '@web3modal/email-react-native';
import styles from './styles';

export function UpdateEmailWalletView() {
  const { data } = useSnapshot(RouterController.state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(data?.email || '');
  const emailConnector = ConnectorController.getEmailConnector();

  const onEmailSubmit = async (value: string) => {
    if (!emailConnector) return;
    const provider = emailConnector.provider as W3mFrameProvider;
    setLoading(true);
    setError('');

    try {
      await provider.updateEmail({ email: value });
      RouterController.push('UpdateEmailPrimaryOtp', { email: value });
    } catch (e) {
      const parsedError = CoreHelperUtil.parseError(e);
      if (parsedError?.includes('Invalid email')) {
        setError('Invalid email. Try again.');
      } else {
        SnackController.showError(parsedError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']}>
      <EmailInput
        initialValue={email}
        onSubmit={onEmailSubmit}
        onChangeText={setEmail}
        loading={loading}
        errorMessage={error}
        style={styles.emailInput}
        autoFocus
      />
      <FlexView flexDirection="row" justifyContent="center" alignItems="center">
        <Button onPress={RouterController.goBack} variant="shade" style={styles.cancelButton}>
          <Text variant="paragraph-600">Cancel</Text>
        </Button>
        <Button
          onPress={() => onEmailSubmit(email)}
          variant="fill"
          style={styles.saveButton}
          disabled={loading}
        >
          <Text color="inverse-100" variant="paragraph-600">
            Save
          </Text>
        </Button>
      </FlexView>
    </FlexView>
  );
}
