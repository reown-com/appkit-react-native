import { useSnapshot } from 'valtio';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Chip,
  CompatibleNetwork,
  FlexView,
  QrCode,
  Spacing,
  Text,
  UiUtil,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetController,
  AssetUtil,
  ConnectionsController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';

export function WalletReceiveView() {
  const { networkImages } = useSnapshot(AssetController.state);
  const { activeNetwork, networks, activeAddress, accountType, identity } = useSnapshot(
    ConnectionsController.state
  );
  const address = CoreHelperUtil.getPlainAddress(activeAddress);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);
  const { padding } = useCustomDimensions();
  const canCopy = OptionsController.isClipboardAvailable();
  const isSmartAccount = accountType === 'smartAccount';

  const approvedNetworks = isSmartAccount
    ? ConnectionsController.getSmartAccountEnabledNetworks()
    : networks.filter(
        network => network?.chainNamespace === ConnectionsController.state.activeNamespace
      );

  const imagesArray = approvedNetworks
    .filter(network => network?.id)
    .slice(0, 5)
    .map(
      network =>
        network.imageUrl ?? AssetUtil.getNetworkImage(network, AssetController.state.networkImages)
    )
    .filter(Boolean) as string[];

  const label = UiUtil.getTruncateString({
    string: identity?.name ?? address ?? '',
    charsStart: identity?.name ? 30 : 4,
    charsEnd: identity?.name ? 0 : 4,
    truncate: identity?.name ? 'end' : 'middle'
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
