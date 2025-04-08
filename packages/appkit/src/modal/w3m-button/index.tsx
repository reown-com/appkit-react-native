import { useSnapshot } from 'valtio';
import { AccountButton, type AccountButtonProps } from '../w3m-account-button';
import { ConnectButton, type ConnectButtonProps } from '../w3m-connect-button';
import { AccountController, ModalController } from '@reown/appkit-core-react-native';

export interface AppKitButtonProps {
  balance?: AccountButtonProps['balance'];
  disabled?: AccountButtonProps['disabled'];
  size?: ConnectButtonProps['size'];
  label?: ConnectButtonProps['label'];
  loadingLabel?: ConnectButtonProps['loadingLabel'];
  accountStyle?: AccountButtonProps['style'];
  connectStyle?: ConnectButtonProps['style'];
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
    <AccountButton
      style={accountStyle}
      balance={balance}
      disabled={disabled}
      testID="account-button"
    />
  ) : (
    <ConnectButton
      style={connectStyle}
      size={size}
      label={label}
      loadingLabel={loadingLabel}
      disabled={disabled}
      testID="connect-button"
    />
  );
}
