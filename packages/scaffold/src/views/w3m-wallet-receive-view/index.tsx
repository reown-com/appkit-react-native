import { useSnapshot } from 'valtio';
import { StyleSheet } from 'react-native';
import { Chip, FlexView, QrCode, Spacing, Text, UiUtil } from '@web3modal/ui-react-native';
import {
  AccountController,
  AssetUtil,
  NetworkController,
  OptionsController,
  SnackController
} from '@web3modal/core-react-native';

export function WalletReceiveView() {
  const { address, profileName } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const canCopy = OptionsController.isClipboardAvailable();

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
    </FlexView>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    marginVertical: Spacing.xl
  }
});
