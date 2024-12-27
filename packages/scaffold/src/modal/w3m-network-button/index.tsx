import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  ApiController,
  AssetUtil,
  ChainController,
  EventsController,
  ModalController
} from '@reown/appkit-core-react-native';
import { NetworkButton as NetworkButtonUI } from '@reown/appkit-ui-react-native';

export interface NetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({ disabled, style }: NetworkButtonProps) {
  const { activeCaipNetwork } = useSnapshot(ChainController.state);
  const { loading } = useSnapshot(ModalController.state);
  const { prefetchLoading } = useSnapshot(ApiController.state);
  const imageSrc = AssetUtil.getNetworkImage(activeCaipNetwork);

  const onNetworkPress = () => {
    ModalController.open({ view: 'Networks' });
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_NETWORKS'
    });
  };

  return (
    <NetworkButtonUI
      imageSrc={imageSrc}
      imageHeaders={ApiController._getApiHeaders()}
      disabled={disabled || loading}
      style={style}
      onPress={onNetworkPress}
      loading={prefetchLoading || loading}
      testID="network-button"
    >
      {activeCaipNetwork?.name ?? (activeCaipNetwork ? 'Unknown Network' : 'Select Network')}
    </NetworkButtonUI>
  );
}
