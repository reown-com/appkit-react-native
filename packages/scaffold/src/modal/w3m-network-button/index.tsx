import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  EventsController,
  ModalController,
  NetworkController,
  ThemeController
} from '@reown/appkit-core-react-native';
import { NetworkButton as NetworkButtonUI, ThemeProvider } from '@reown/appkit-ui-react-native';

export interface NetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({ disabled, style }: NetworkButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
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
        imageSrc={AssetUtil.getNetworkImage(caipNetwork)}
        imageHeaders={ApiController._getApiHeaders()}
        disabled={disabled || loading}
        style={style}
        onPress={onNetworkPress}
        loading={loading}
        testID="network-button"
      >
        {caipNetwork?.name ?? (isConnected ? 'Unknown Network' : 'Select Network')}
      </NetworkButtonUI>
    </ThemeProvider>
  );
}
