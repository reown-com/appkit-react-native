import { useSnapshot } from 'valtio';
import {
  AccountController,
  AssetController,
  CoreHelperUtil,
  NetworkController,
  ModalController
} from '@web3modal/core-react-native';

import { AccountButton } from '@web3modal/ui-react-native';
import { ApiController } from '@web3modal/core-react-native';

export interface W3mAccountButtonProps {
  balance?: 'show' | 'hide';
  disabled?: boolean;
}

export function W3mAccountButton({ balance, disabled }: W3mAccountButtonProps) {
  const { networkImages } = useSnapshot(AssetController.state);
  const {
    address,
    balance: balanceVal,
    balanceSymbol,
    profileImage,
    profileName
  } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);

  const networkImage = networkImages[caipNetwork?.imageId ?? ''];
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
      balance={showBalance ? CoreHelperUtil.formatBalance(balanceVal, balanceSymbol) : ''}
    />
  );
}
