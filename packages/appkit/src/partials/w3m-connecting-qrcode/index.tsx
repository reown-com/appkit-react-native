import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import {
  WcController,
  EventsController,
  OptionsController,
  SnackController
} from '@reown/appkit-core-react-native';
import { FlexView, Link, QrCode, Text, Spacing } from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingQrCode() {
  const { wcUri } = useSnapshot(WcController.state);
  const showCopy = OptionsController.isClipboardAvailable();
  const { maxWidth: windowSize, isPortrait } = useCustomDimensions();
  const qrSize = (windowSize - Spacing.xl * 2) / (isPortrait ? 1 : 1.5);

  const onCopyAddress = () => {
    if (WcController.state.wcUri) {
      OptionsController.copyToClipboard(WcController.state.wcUri);
      SnackController.showSuccess('Link copied');
    }
  };

  const onConnect = async () => {
    await WcController.state.wcPromise;

    EventsController.sendEvent({
      type: 'track',
      event: 'CONNECT_SUCCESS',
      properties: {
        method: 'qrcode',
        name: 'WalletConnect'
      }
    });
  };

  useEffect(() => {
    if (wcUri) {
      onConnect();
    }
  }, [wcUri]);

  return (
    <FlexView
      alignItems="center"
      justifyContent="center"
      flexDirection={isPortrait ? 'column' : 'row'}
      padding={['xl', 'xl', '2xl', 'xl']}
    >
      <QrCode size={qrSize} uri={wcUri} testID="qr-code" />
      <FlexView alignItems="center" margin="m">
        <Text variant="paragraph-500">Scan this QR code with your phone</Text>
        {showCopy && (
          <Link
            iconLeft="copySmall"
            color="fg-200"
            style={styles.copyButton}
            onPress={onCopyAddress}
            testID="copy-link"
          >
            Copy link
          </Link>
        )}
      </FlexView>
    </FlexView>
  );
}
