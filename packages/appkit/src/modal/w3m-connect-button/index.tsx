import { useSnapshot } from 'valtio';
import { ModalController, ThemeController } from '@reown/appkit-core-react-native';
import {
  ConnectButton as ConnectButtonUI,
  ThemeProvider,
  type ConnectButtonProps as ConnectButtonUIProps
} from '@reown/appkit-ui-react-native';

export interface ConnectButtonProps {
  label: string;
  loadingLabel: string;
  size?: ConnectButtonUIProps['size'];
  style?: ConnectButtonUIProps['style'];
  disabled?: ConnectButtonUIProps['disabled'];
  testID?: string;
}

export function ConnectButton({
  label,
  loadingLabel,
  size = 'md',
  style,
  disabled,
  testID
}: ConnectButtonProps) {
  const { open, loading } = useSnapshot(ModalController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <ConnectButtonUI
        onPress={() => ModalController.open()}
        size={size}
        loading={loading || open}
        style={style}
        testID={testID}
        disabled={disabled}
      >
        {loading || open ? loadingLabel : label}
      </ConnectButtonUI>
    </ThemeProvider>
  );
}
