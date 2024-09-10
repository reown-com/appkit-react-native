import { useSnapshot } from 'valtio';
import {
  AccountController,
  CoreHelperUtil,
  NetworkController,
  ModalController,
  AssetUtil
} from '@reown/core-react-native';

import { AccountButton } from '@reown/ui-react-native';
import { ApiController } from '@reown/core-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export interface AppKitAccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AppKitAccountButton({
  balance,
  disabled,
  style,
  testID
}: AppKitAccountButtonProps) {
  const {
    address,
    balance: balanceVal,
    balanceSymbol,
    profileImage,
    profileName
  } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);

  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showBalance = balance === 'show';

  return (
    <AccountButton
      onPress={ModalController.open}
      address={profileName ?? address}
      isProfileName={Boolean(profileName)}
      networkSrc={networkImage}
      imageHeaders={ApiController._getApiHeaders()}
      avatarSrc={profileImage}
      disabled={disabled}
      style={style}
      balance={showBalance ? CoreHelperUtil.formatBalance(balanceVal, balanceSymbol) : ''}
      testID={testID}
    />
  );
}
