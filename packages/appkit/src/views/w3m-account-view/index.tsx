import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
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
  ApiController,
  AssetController,
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
  const [isLoading, setIsLoading] = useState(false);
  const { padding } = useCustomDimensions();
  const { activeNetwork, activeAddress } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const address = CoreHelperUtil.getPlainAddress(activeAddress);
  const networkImage = activeNetwork ? networkImages[activeNetwork.id] : undefined;

  const onProfilePress = () => {
    RouterController.push('AccountDefault');
  };

  const onNetworkPress = () => {
    RouterController.push('Networks');
  };

  useEffect(() => {
    async function fetchBalance() {
      setIsLoading(true);
      await ConnectionsController.fetchBalance();
      setIsLoading(false);
    }

    fetchBalance();
    SendController.resetState();

    const balanceInterval = setInterval(() => {
      fetchBalance();
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
        imageSrc={networkImage}
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
        <AccountWalletFeatures isBalanceLoading={isLoading} />
      </FlexView>
    </ScrollView>
  );
}
