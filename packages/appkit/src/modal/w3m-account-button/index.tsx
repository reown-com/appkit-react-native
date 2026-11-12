import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  CoreHelperUtil,
  ModalController,
  ThemeController,
  ConnectionsController,
  AssetController,
  AssetUtil
} from '@reown/appkit-core-react-native';
import { AccountButton as AccountButtonUI, ThemeProvider } from '@reown/appkit-ui-react-native';

export interface AccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccountButton({ balance, disabled, style, testID }: AccountButtonProps) {
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const {
    activeAddress: address,
    activeBalance,
    activeNetwork,
    activeCaipNetworkId,
    identity
  } = useSnapshot(ConnectionsController.state);

  // Connected to a network the app doesn't support (e.g. the wallet switched to it)
  const isUnsupportedNetwork = !!activeCaipNetworkId && !activeNetwork;

  const onPress = () => {
    if (isUnsupportedNetwork) {
      ModalController.open({ view: 'UnsupportedChain' });
    } else {
      ModalController.open();
    }
  };

  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);
  const showBalance = balance === 'show';

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <AccountButtonUI
        onPress={onPress}
        address={address?.split(':')[2] ?? ''}
        profileName={identity?.name}
        networkSrc={networkImage}
        avatarSrc={identity?.avatar}
        disabled={disabled}
        style={style}
        balance={
          showBalance
            ? CoreHelperUtil.formatBalance(activeBalance?.amount, activeBalance?.symbol)
            : ''
        }
        testID={testID}
      />
    </ThemeProvider>
  );
}
