import { useSnapshot } from 'valtio';
import { AppKitAccountButton, type AppKitAccountButtonProps } from '../w3m-account-button';
import { AppKitConnectButton, type AppKitConnectButtonProps } from '../w3m-connect-button';
import { AccountController, ModalController } from '@reown/appkit-core-react-native';

export interface AppKitButtonProps {
  balance?: AppKitAccountButtonProps['balance'];
  disabled?: AppKitAccountButtonProps['disabled'];
  size?: AppKitConnectButtonProps['size'];
  label?: AppKitConnectButtonProps['label'];
  loadingLabel?: AppKitConnectButtonProps['loadingLabel'];
  accountStyle?: AppKitAccountButtonProps['style'];
  connectStyle?: AppKitConnectButtonProps['style'];
}

export function AppKitButton({
  balance,
  disabled,
  size,
  label = 'Connect',
  loadingLabel = 'Connecting',
  accountStyle,
  connectStyle
}: AppKitButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  const { loading } = useSnapshot(ModalController.state);

  return !loading && isConnected ? (
    <AppKitAccountButton
      style={accountStyle}
      balance={balance}
      disabled={disabled}
      testID="button-account"
    />
  ) : (
    <AppKitConnectButton
      style={connectStyle}
      size={size}
      label={label}
      loadingLabel={loadingLabel}
      disabled={disabled}
      testID="button-connect"
    />
  );
}
