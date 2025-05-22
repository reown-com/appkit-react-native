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
  const { loading } = useSnapshot(ModalController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);

  const isNetworkSupported =
    !NetworkController.state.caipNetwork ||
    !NetworkController.state.requestedCaipNetworks?.length ||
    NetworkController.state.requestedCaipNetworks.some(
      network => network.id === NetworkController.state.caipNetwork?.id
    );

  const onNetworkPress = () => {
    if (AccountController.state.isConnected && !isNetworkSupported) {
      ModalController.open({ view: 'UnsupportedChain' });
    } else {
      ModalController.open({ view: 'Networks' });
    }
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_NETWORKS'
    });
  };

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <NetworkButtonUI
        imageSrc={AssetUtil.getNetworkImage(NetworkController.state.caipNetwork)}
        imageHeaders={ApiController._getApiHeaders()}
        disabled={disabled || loading}
        style={style}
        onPress={onNetworkPress}
        loading={loading}
        testID="network-button"
      >
        {NetworkController.state.caipNetwork?.name ??
          (AccountController.state.isConnected
            ? isNetworkSupported
              ? 'Unknown Network'
              : 'Switch Network'
            : 'Select Network')}
      </NetworkButtonUI>
    </ThemeProvider>
  );
}
