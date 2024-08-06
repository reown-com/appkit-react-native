import { useSnapshot } from 'valtio';
import { FlexView, Icon, IconLink, NetworkButton, useTheme } from '@web3modal/ui-react-native';
import {
  ApiController,
  AssetUtil,
  ModalController,
  NetworkController,
  RouterController
} from '@web3modal/core-react-native';
import { AccountWalletFeatures } from '../../partials/w3m-account-wallet-features';
import styles from './styles';

export function AccountView() {
  const Theme = useTheme();
  const { caipNetwork } = useSnapshot(NetworkController.state);

  const onNetworkPress = () => {
    RouterController.push('Networks');
  };

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
        <AccountWalletFeatures />
      </FlexView>
    </>
  );
}
