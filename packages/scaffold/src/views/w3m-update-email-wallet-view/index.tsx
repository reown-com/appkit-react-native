import { useState } from 'react';
import { Platform } from 'react-native';
import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  EventsController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import { Button, EmailInput, FlexView, Spacing, Text } from '@reown/appkit-ui-react-native';
import { useKeyboard } from '../../hooks/useKeyboard';

import styles from './styles';

export function UpdateEmailWalletView() {
  const { data } = RouterController.state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(data?.email || '');
  const [isValidNewEmail, setIsValidNewEmail] = useState(false);
  const authConnector = ConnectorController.getAuthConnector();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing.l : Spacing.l,
    default: Spacing.l
  });

  const onChangeText = (value: string) => {
    setIsValidNewEmail(data?.email !== value && CoreHelperUtil.isValidEmail(value));
    setEmail(value);
    setError('');
  };

  const onEmailSubmit = async (value: string) => {
    if (!authConnector) return;

    const provider = authConnector.provider as AppKitFrameProvider;
    setLoading(true);
    setError('');

    try {
      const response = await provider.updateEmail({ email: value });
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_EDIT' });
      if (response.action === 'VERIFY_SECONDARY_OTP') {
        RouterController.push('UpdateEmailSecondaryOtp', { email: data?.email, newEmail: value });
      } else {
        RouterController.push('UpdateEmailPrimaryOtp', { email: data?.email, newEmail: value });
      }
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
    <FlexView padding={['l', 's', '0', 's']} style={{ paddingBottom }}>
      <EmailInput
        initialValue={data?.email}
        onSubmit={onEmailSubmit}
        submitEnabled={isValidNewEmail}
        onChangeText={onChangeText}
        loading={loading}
        errorMessage={error}
        style={styles.emailInput}
        autoFocus
      />
      <FlexView
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        margin={['0', 'xs', '0', 'xs']}
      >
        <Button onPress={RouterController.goBack} variant="shade" style={styles.cancelButton}>
          <Text variant="paragraph-600" color="fg-100">
            Cancel
          </Text>
        </Button>
        <Button
          onPress={() => onEmailSubmit(email)}
          variant="fill"
          style={styles.saveButton}
          disabled={loading || !isValidNewEmail}
        >
          Save
        </Button>
      </FlexView>
    </FlexView>
  );
}
