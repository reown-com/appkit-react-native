import { useSnapshot } from 'valtio';
import {
  AccountController,
  CoreHelperUtil,
  NetworkController,
  ModalController,
  AssetUtil
} from '@web3modal/core-react-native';

import { AccountButton } from '@web3modal/ui-react-native';
import { ApiController } from '@web3modal/core-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export interface W3mAccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function W3mAccountButton({ balance, disabled, style }: W3mAccountButtonProps) {
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
    />
  );
}
