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
} from '@web3modal/ui-react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  NetworkController,
  OptionsController,
  SnackController
} from '@web3modal/core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function WalletReceiveView() {
  const { address, profileName } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const { padding } = useCustomDimensions();
  const canCopy = OptionsController.isClipboardAvailable();
  const slicedNetworks =
    NetworkController.getApprovedCaipNetworks()
      .filter(network => network?.imageId)
      ?.slice(0, 5) || [];
  const imagesArray = slicedNetworks.map(AssetUtil.getNetworkImage).filter(Boolean) as string[];

  const label = UiUtil.getTruncateString({
    string: profileName ?? address ?? '',
    charsStart: profileName ? 30 : 4,
    charsEnd: profileName ? 0 : 4,
    truncate: profileName ? 'end' : 'middle'
  });

  const onCopyAddress = () => {
    if (canCopy && address) {
      OptionsController.copyToClipboard(profileName ?? address);
      SnackController.showSuccess('Address copied');
    }
  };

  if (!address) return;

  return (
    <ScrollView bounces={false} style={{ paddingHorizontal: padding }}>
      <FlexView padding={['xl', 'xl', '2xl', 'xl']} alignItems="center">
        <Chip
          label={label}
          icon={canCopy ? 'copy' : undefined}
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
          onPress={() => {}}
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
