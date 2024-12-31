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
  ChainController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function WalletReceiveView() {
  const { address, profileName, preferredAccountType } = useSnapshot(AccountController.state);
  const { activeCaipNetwork } = useSnapshot(ChainController.state);
  const networkImage = AssetUtil.getNetworkImage(activeCaipNetwork);
  const { padding } = useCustomDimensions();
  const canCopy = OptionsController.isClipboardAvailable();

  const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
  const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
  const isNetworkEnabledForSmartAccounts = ChainController.checkIfSmartAccountEnabled();

  let sortedNetworks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);

  if (isNetworkEnabledForSmartAccounts && preferredAccountType === 'smartAccount') {
    if (!activeCaipNetwork) {
      return null;
    }

    const smartAccountEnabledNetworkIds = ChainController.getSmartAccountEnabledNetworks(
      activeCaipNetwork?.chainNamespace
    );

    sortedNetworks = requestedCaipNetworks.filter(
      network => smartAccountEnabledNetworkIds?.includes(Number(network.id))
    );
  }

  const imagesArray = sortedNetworks
    .filter(network => network?.assets?.imageId)
    .slice(0, 5)
    .map(AssetUtil.getNetworkImage)
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
    if (canCopy && AccountController.state.address) {
      OptionsController.copyToClipboard(AccountController.state.address);
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
