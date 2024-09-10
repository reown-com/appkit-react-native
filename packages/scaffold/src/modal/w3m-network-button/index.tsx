import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  EventsController,
  ModalController,
  NetworkController
} from '@reown/core-react-native';
import { NetworkButton } from '@reown/ui-react-native';

export interface W3mNetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function W3mNetworkButton({ disabled, style }: W3mNetworkButtonProps) {
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
