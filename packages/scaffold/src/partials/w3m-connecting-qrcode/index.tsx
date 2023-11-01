import { useSnapshot } from 'valtio';
import {
  ConnectionController,
  OptionsController,
  SnackController
} from '@web3modal/core-react-native';
import { FlexView, Link, QrCode, Text, Spacing } from '@web3modal/ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function ConnectingQrCode() {
  const { wcUri } = useSnapshot(ConnectionController.state);
  const showCopy = OptionsController.isClipboardAvailable();
  const { maxWidth: windowSize, isPortrait } = useCustomDimensions();
  const qrSize = (windowSize - Spacing.l * 2) / (isPortrait ? 1 : 1.5);

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
      gap="m"
      flexDirection={isPortrait ? 'column' : 'row'}
      padding={['m', 'm', '2xl', 'm']}
    >
      <QrCode size={qrSize} uri={wcUri} />
      <FlexView gap="m" alignItems="center">
        <Text variant="paragraph-500">Scan this QR code with your phone</Text>
        {showCopy && (
          <Link iconLeft="copy" color="fg-200" onPress={onCopyAddress}>
            Copy link
          </Link>
        )}
      </FlexView>
    </FlexView>
  );
}
