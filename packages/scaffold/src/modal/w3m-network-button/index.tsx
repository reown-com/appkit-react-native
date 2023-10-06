import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ModalController,
  NetworkController
} from '@web3modal/core-react-native';
import { NetworkButton } from '@web3modal/ui-react-native';

export interface W3mNetworkButtonProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function W3mNetworkButton({ disabled, style }: W3mNetworkButtonProps) {
  const { isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);

  return (
    <NetworkButton
      imageSrc={AssetUtil.getNetworkImage(caipNetwork)}
      imageHeaders={ApiController._getApiHeaders()}
      disabled={disabled}
      variant="shade"
      style={style}
      onPress={() => ModalController.open({ view: 'Networks' })}
    >
      {caipNetwork?.name ?? (isConnected ? 'Unknown Network' : 'Select Network')}
    </NetworkButton>
  );
}
