import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import {
  FlexView,
  Icon,
  IconLink,
  NetworkButton,
  AccountPill,
  useTheme
} from '@web3modal/ui-react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ModalController,
  NetworkController,
  OptionsController,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
import { AccountWalletFeatures } from '../../partials/w3m-account-wallet-features';
import styles from './styles';

export function AccountView() {
  const Theme = useTheme();
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { address, profileName, profileImage } = useSnapshot(AccountController.state);

  const onCopyAddress = (value: string) => {
    if (value) {
      OptionsController.copyToClipboard(value);
      SnackController.showSuccess('Address copied');
    }
  };

  const onProfilePress = () => {
    RouterController.push('AccountDefault');
  };

  const onNetworkPress = () => {
    RouterController.push('Networks');
  };

  useEffect(() => {
    AccountController.fetchTokenBalance();
  }, []);

  return (
    <>
      <NetworkButton
        imageSrc={AssetUtil.getNetworkImage(caipNetwork)}
        imageHeaders={ApiController._getApiHeaders()}
        onPress={onNetworkPress}
        style={styles.networkIcon}
        background={false}
      >
        <Icon name="chevronBottom" size="sm" color="fg-200" />
      </NetworkButton>
      <IconLink icon="close" style={styles.closeIcon} onPress={ModalController.close} />
      <FlexView padding={['3xl', 's', '3xl', 's']} style={[{ backgroundColor: Theme['bg-100'] }]}>
        <AccountPill
          address={address}
          profileName={profileName}
          profileImage={profileImage}
          onCopy={onCopyAddress}
          onPress={onProfilePress}
          style={styles.accountPill}
        />
        <AccountWalletFeatures />
      </FlexView>
    </>
  );
}
