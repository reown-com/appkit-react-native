import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import {
  AccountPill,
  FlexView,
  Icon,
  IconLink,
  NetworkButton,
  useTheme
} from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ConnectionsController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SendController
} from '@reown/appkit-core-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { AccountWalletFeatures } from '../../partials/w3m-account-wallet-features';
import styles from './styles';

export function AccountView() {
  const Theme = useTheme();
  const { padding } = useCustomDimensions();
  const { activeNetwork, activeAddress, accountType } = useSnapshot(ConnectionsController.state);
  const address = CoreHelperUtil.getPlainAddress(activeAddress);
  // const { profileName, profileImage, preferredAccountType } = useSnapshot(
  //   AccountController.state
  // );
  // const showActivate = accountType === 'eoa';

  console.log('type', accountType);

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

  useEffect(() => {
    AccountController.fetchTokenBalance();

    const balanceInterval = setInterval(() => {
      AccountController.fetchTokenBalance();
    }, 10000);

    return () => {
      clearInterval(balanceInterval);
    };
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
        imageSrc={AssetUtil.getNetworkImage(activeNetwork?.id)}
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
          // profileName={profileName}
          // profileImage={profileImage}
          onPress={onProfilePress}
          style={styles.accountPill}
        />
        <AccountWalletFeatures />
      </FlexView>
    </ScrollView>
  );
}
