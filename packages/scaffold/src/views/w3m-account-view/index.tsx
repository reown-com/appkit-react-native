import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  AccountPill,
  FlexView,
  Icon,
  IconLink,
  NetworkButton,
  useTheme,
  Promo
} from '@reown/appkit-ui-react-native';
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
} from '@reown/appkit-core-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { AccountWalletFeatures } from '../../partials/w3m-account-wallet-features';
import styles from './styles';

export function AccountView() {
  const Theme = useTheme();
  const { padding } = useCustomDimensions();
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { address, profileName, profileImage, preferredAccountType } = useSnapshot(
    AccountController.state
  );
  const showActivate =
    preferredAccountType === 'eoa' && NetworkController.checkIfSmartAccountEnabled();

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

  const onActivatePress = () => {
    RouterController.push('UpgradeToSmartAccount');
  };

  useEffect(() => {
    AccountController.fetchTokenBalance();
    SendController.resetSend();
  }, []);

  return (
    <BottomSheetScrollView
      bounces={false}
      style={styles.container}
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
        {showActivate && (
          <Promo style={styles.promoPill} text="Activate your account" onPress={onActivatePress} />
        )}
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
    </BottomSheetScrollView>
  );
}
