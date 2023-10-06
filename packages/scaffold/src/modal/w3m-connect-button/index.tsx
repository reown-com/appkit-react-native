import { useSnapshot } from 'valtio';
import { ModalController } from '@web3modal/core-react-native';
import { ConnectButton, type ConnectButtonProps } from '@web3modal/ui-react-native';

export interface W3mConnectButtonProps {
  label: string;
  loadingLabel: string;
  size?: ConnectButtonProps['size'];
  style?: ConnectButtonProps['style'];
}

export function W3mConnectButton({
  label,
  loadingLabel,
  size = 'md',
  style
}: W3mConnectButtonProps) {
  const { open } = useSnapshot(ModalController.state);

  return (
    <ConnectButton onPress={() => ModalController.open()} size={size} loading={open} style={style}>
      {open ? loadingLabel : label}
    </ConnectButton>
  );
}
