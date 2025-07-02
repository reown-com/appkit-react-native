import { useSnapshot } from 'valtio';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Chip,
  CompatibleNetwork,
  FlexView,
  QrCode,
  Spacing,
  Text,
  UiUtil
} from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ConnectionsController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function WalletReceiveView() {
  const { profileName /*preferredAccountType*/ } = useSnapshot(AccountController.state);
  const { activeNetwork, networks, activeAddress } = useSnapshot(ConnectionsController.state);
  const address = CoreHelperUtil.getPlainAddress(activeAddress);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork?.id);
  const { padding } = useCustomDimensions();
  const canCopy = OptionsController.isClipboardAvailable();
  // const isSmartAccount =
  //   preferredAccountType === 'smartAccount' && NetworkController.checkIfSmartAccountEnabled();
  // const networks = isSmartAccount
  //   ? NetworkController.getSmartAccountEnabledNetworks()
  //   : NetworkController.getApprovedCaipNetworks();

  const imagesArray = networks
    .filter(network => network?.id)
    .slice(0, 5)
    .map(network => AssetUtil.getNetworkImage(network?.id))
    .filter(Boolean) as string[];

  const label = UiUtil.getTruncateString({
    string: profileName ?? address ?? '',
    charsStart: profileName ? 30 : 4,
    charsEnd: profileName ? 0 : 4,
    truncate: profileName ? 'end' : 'middle'
  });

  const onNetworkPress = () => {
    RouterController.push('WalletCompatibleNetworks');
  };

  const onCopyAddress = () => {
    if (canCopy && address) {
      OptionsController.copyToClipboard(address);
      SnackController.showSuccess('Address copied');
    }
  };

  if (!address) return;

  return (
    <ScrollView bounces={false} style={{ paddingHorizontal: padding }}>
      <FlexView padding={['xl', 'xl', '2xl', 'xl']} alignItems="center">
        <Chip
          label={label}
          rightIcon={canCopy ? 'copy' : undefined}
          imageSrc={networkImage}
          variant="transparent"
          onPress={onCopyAddress}
        />
        <QrCode uri={address} size={232} arenaClear style={styles.qrContainer} />
        <Text variant="paragraph-500" color="fg-100">
          {canCopy ? 'Copy your address or scan this QR code' : 'Scan this QR code'}
        </Text>
        <CompatibleNetwork
          text="Only receive from networks"
          onPress={onNetworkPress}
          networkImages={imagesArray}
          imageHeaders={ApiController._getApiHeaders()}
          style={styles.networksButton}
        />
      </FlexView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    marginVertical: Spacing.xl
  },
  networksButton: {
    marginTop: Spacing.l
  }
});
