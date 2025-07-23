import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  AccountController,
  CoreHelperUtil,
  NetworkController,
  ModalController,
  AssetUtil,
  ThemeController,
  ApiController
} from '@reown/appkit-core-react-native';
import { AccountButton as AccountButtonUI, ThemeProvider } from '@reown/appkit-ui-react-native';

export interface AccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccountButton({ balance, disabled, style, testID }: AccountButtonProps) {
  const {
    address,
    balance: balanceVal,
    balanceSymbol,
    profileImage,
    profileName
  } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);

  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showBalance = balance === 'show';

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <AccountButtonUI
        onPress={() => ModalController.open()}
        address={address}
        profileName={profileName}
        networkSrc={networkImage}
        imageHeaders={ApiController._getApiHeaders()}
        avatarSrc={profileImage}
        disabled={disabled}
        style={style}
        balance={showBalance ? CoreHelperUtil.formatBalance(balanceVal, balanceSymbol) : ''}
        testID={testID}
      />
    </ThemeProvider>
  );
}
