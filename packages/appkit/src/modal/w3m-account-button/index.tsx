import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  CoreHelperUtil,
  ModalController,
  ThemeController,
  ConnectionsController,
  AssetController
} from '@reown/appkit-core-react-native';
import { AccountButton as AccountButtonUI, ThemeProvider } from '@reown/appkit-ui-react-native';

export interface AccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccountButton({ balance, disabled, style, testID }: AccountButtonProps) {
  const { profileImage, profileName } = useSnapshot(AccountController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const {
    activeAddress: address,
    activeBalance,
    activeNetwork
  } = useSnapshot(ConnectionsController.state);

  const networkImage = activeNetwork ? networkImages[activeNetwork.id] : undefined;
  const showBalance = balance === 'show';

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <AccountButtonUI
        onPress={() => ModalController.open()}
        address={address?.split(':')[2] ?? ''}
        profileName={profileName}
        networkSrc={networkImage}
        avatarSrc={profileImage}
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
