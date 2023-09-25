import { useSnapshot } from 'valtio';
import { W3mAccountButton, type W3mAccountButtonProps } from '../w3m-account-button';
import { W3mConnectButton, type W3mConnectButtonProps } from '../w3m-connect-button';
import { AccountController } from '@web3modal/core-react-native';

export interface W3mButtonProps {
  balance?: W3mAccountButtonProps['balance'];
  disabled?: W3mAccountButtonProps['disabled'];
  size?: W3mConnectButtonProps['size'];
  label?: W3mConnectButtonProps['label'];
  loadingLabel?: W3mConnectButtonProps['loadingLabel'];
}

export function W3mButton({
  balance,
  disabled,
  size,
  label = 'Connect',
  loadingLabel = 'Connecting'
}: W3mButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  return isConnected ? (
    <W3mAccountButton balance={balance} disabled={disabled} />
  ) : (
    <W3mConnectButton size={size} label={label} loadingLabel={loadingLabel} />
  );
}
