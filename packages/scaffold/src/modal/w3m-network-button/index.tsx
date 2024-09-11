import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  EventsController,
  ModalController,
  NetworkController
} from '@reown/appkit-core-react-native';
import { NetworkButton } from '@reown/appkit-ui-react-native';

export interface AppKitNetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppKitNetworkButton({ disabled, style }: AppKitNetworkButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { loading } = useSnapshot(ModalController.state);

  const onNetworkPress = () => {
    ModalController.open({ view: 'Networks' });
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_NETWORKS'
    });
  };

  return (
    <NetworkButton
      imageSrc={AssetUtil.getNetworkImage(caipNetwork)}
      imageHeaders={ApiController._getApiHeaders()}
      disabled={disabled || loading}
      style={style}
      onPress={onNetworkPress}
      loading={loading}
    >
      {caipNetwork?.name ?? (isConnected ? 'Unknown Network' : 'Select Network')}
    </NetworkButton>
  );
}
