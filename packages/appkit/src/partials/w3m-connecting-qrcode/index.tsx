import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import {
  WcController,
  EventsController,
  OptionsController,
  SnackController,
  ConnectionsController,
  CoreHelperUtil
} from '@reown/appkit-core-react-native';
import {
  FlexView,
  Link,
  QrCode,
  Text,
  Spacing,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import { ReownButton } from './components/ReownButton';
import { useWindowDimensions } from 'react-native';

const LOGO_SIZE = 60;
const LOGO_BORDER_RADIUS = 10;

export function ConnectingQrCode() {
  const { height, width } = useWindowDimensions();
  const windowSize = Math.min(height, width);
  const { wcUri } = useSnapshot(WcController.state);
  const showCopy = OptionsController.isClipboardAvailable();
  const { isPortrait } = useCustomDimensions();
  const qrSize = (windowSize - Spacing.xl * 2) / (isPortrait ? 1 : 1.5);

  const onCopyAddress = () => {
    if (WcController.state.wcUri) {
      OptionsController.copyToClipboard(WcController.state.wcUri);
      SnackController.showSuccess('Link copied');
    }
  };

  const onConnect = async () => {
    await WcController.state.wcPromise;
    const address = ConnectionsController.state.activeAddress;
    const caipNetworkId = ConnectionsController.state.activeNetwork?.caipNetworkId;

    EventsController.sendEvent({
      type: 'track',
      event: 'CONNECT_SUCCESS',
      address: CoreHelperUtil.getPlainAddress(address),
      properties: {
        method: 'qrcode',
        name: 'WalletConnect',
        caipNetworkId
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
      padding={['xl', 'xl', 'xs', 'xl']}
    >
      <QrCode
        size={qrSize}
        uri={wcUri}
        testID="qr-code"
        logoBorderRadius={LOGO_BORDER_RADIUS}
        logoSize={LOGO_SIZE}
      />
      <FlexView alignItems="center" margin="m">
        <Text variant="paragraph-500">Scan this QR code with your phone</Text>
        {showCopy ? (
          <Link
            iconLeft="copySmall"
            color="fg-200"
            style={styles.copyButton}
            onPress={onCopyAddress}
            testID="copy-link"
          >
            Copy link
          </Link>
        ) : null}
        <ReownButton style={styles.reownButton} />
      </FlexView>
    </FlexView>
  );
}
