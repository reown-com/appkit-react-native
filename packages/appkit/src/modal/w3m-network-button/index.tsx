import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ConnectionsController,
  EventsController,
  ModalController,
  ThemeController
} from '@reown/appkit-core-react-native';
import { NetworkButton as NetworkButtonUI, ThemeProvider } from '@reown/appkit-ui-react-native';

export interface NetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({ disabled, style }: NetworkButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const { loading } = useSnapshot(ModalController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);

  const onNetworkPress = () => {
    ModalController.open({ view: 'Networks' });
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_NETWORKS'
    });
  };

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <NetworkButtonUI
        imageSrc={AssetUtil.getNetworkImage(activeNetwork?.id)}
        imageHeaders={ApiController._getApiHeaders()}
        disabled={disabled || loading}
        style={style}
        onPress={onNetworkPress}
        loading={loading}
        testID="network-button"
      >
        {activeNetwork?.name ?? (isConnected ? 'Unknown Network' : 'Select Network')}
      </NetworkButtonUI>
    </ThemeProvider>
  );
}
