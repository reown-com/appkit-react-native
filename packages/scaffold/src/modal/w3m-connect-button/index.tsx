import { useSnapshot } from 'valtio';
import { ModalController } from '@reown/core-react-native';
import { ConnectButton, type ConnectButtonProps } from '@reown/ui-react-native';

export interface AppKitConnectButtonProps {
  label: string;
  loadingLabel: string;
  size?: ConnectButtonProps['size'];
  style?: ConnectButtonProps['style'];
  disabled?: ConnectButtonProps['disabled'];
  testID?: string;
}

export function AppKitConnectButton({
  label,
  loadingLabel,
  size = 'md',
  style,
  disabled,
  testID
}: AppKitConnectButtonProps) {
  const { open, loading } = useSnapshot(ModalController.state);

  return (
    <ConnectButton
      onPress={() => ModalController.open()}
      size={size}
      loading={loading || open}
      style={style}
      testID={testID}
      disabled={disabled}
    >
      {loading || open ? loadingLabel : label}
    </ConnectButton>
  );
}
