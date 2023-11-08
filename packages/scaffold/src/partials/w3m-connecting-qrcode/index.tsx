import { useSnapshot } from 'valtio';
import {
  ConnectionController,
  OptionsController,
  SnackController
} from '@web3modal/core-react-native';
import { FlexView, Link, QrCode, Text, Spacing } from '@web3modal/ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingQrCode() {
  const { wcUri } = useSnapshot(ConnectionController.state);
  const showCopy = OptionsController.isClipboardAvailable();
  const { maxWidth: windowSize, isPortrait } = useCustomDimensions();
  const qrSize = (windowSize - Spacing.xl * 2) / (isPortrait ? 1 : 1.5);

  const onCopyAddress = () => {
    if (wcUri) {
      OptionsController.copyToClipboard(wcUri);
      SnackController.showSuccess('Link copied');
    }
  };

  return (
    <FlexView
      alignItems="center"
      justifyContent="center"
      flexDirection={isPortrait ? 'column' : 'row'}
      padding={['xl', 'xl', '2xl', 'xl']}
    >
      <QrCode size={qrSize} uri={wcUri} />
      <FlexView alignItems="center" margin="m">
        <Text variant="paragraph-500">Scan this QR code with your phone</Text>
        {showCopy && (
          <Link
            iconLeft="copySmall"
            color="fg-200"
            style={styles.copyButton}
            onPress={onCopyAddress}
          >
            Copy link
          </Link>
        )}
      </FlexView>
    </FlexView>
  );
}
