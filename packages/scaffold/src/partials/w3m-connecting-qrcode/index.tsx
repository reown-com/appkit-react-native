import {
  ConnectionController,
  OptionsController,
  SnackController
} from '@web3modal/core-react-native';
import { FlexView, Link, QrCode, Text, Spacing } from '@web3modal/ui-react-native';
import { useSnapshot } from 'valtio';
import { useWindowDimensions } from 'react-native';

export function ConnectingQrCode() {
  const { wcUri } = useSnapshot(ConnectionController.state);
  const showCopy = OptionsController.isClipboardAvailable();
  const { height, width } = useWindowDimensions();
  const windowSize = Math.min(height, width);
  const qrSize = windowSize - Spacing.l * 2;

  const onCopyAddress = () => {
    if (wcUri) {
      OptionsController.copyToClipboard(wcUri);
      SnackController.showSuccess('Link copied');
    }
  };

  return (
    <FlexView alignItems="center" gap="m" padding={['m', 'm', '2xl', 'm']}>
      <QrCode size={qrSize} uri={wcUri} />
      <Text variant="paragraph-500">Scan this QR code with your phone</Text>
      {showCopy && (
        <Link iconLeft="copy" color="fg-200" onPress={onCopyAddress}>
          Copy link
        </Link>
      )}
    </FlexView>
  );
}
