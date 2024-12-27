import { useSnapshot } from 'valtio';
import {
  AccountController,
  CoreHelperUtil,
  ModalController,
  AssetUtil,
  ChainController
} from '@reown/appkit-core-react-native';

import { AccountButton as AccountButtonUI } from '@reown/appkit-ui-react-native';
import { ApiController } from '@reown/appkit-core-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

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
  const { activeCaipNetwork } = useSnapshot(ChainController.state);

  const networkImage = AssetUtil.getNetworkImage(activeCaipNetwork);
  const showBalance = balance === 'show';

  return (
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
  );
}
