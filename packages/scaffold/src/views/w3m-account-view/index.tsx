import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';
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
  SendController,
  SnackController
} from '@web3modal/core-react-native';
import { AccountWalletFeatures } from '../../partials/w3m-account-wallet-features';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function AccountView() {
  const Theme = useTheme();
  const { padding } = useCustomDimensions();
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { address, profileName, profileImage } = useSnapshot(AccountController.state);

  const onCopyAddress = (value: string) => {
    if (OptionsController.isClipboardAvailable() && value) {
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
    SendController.resetSend();
  }, []);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingHorizontal: padding
        }
      ]}
    >
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
      <FlexView padding={['3xl', '0', '0', '0']} style={[{ backgroundColor: Theme['bg-100'] }]}>
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
    </ScrollView>
  );
}
