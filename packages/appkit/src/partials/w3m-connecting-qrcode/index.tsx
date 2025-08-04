import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import {
  WcController,
  EventsController,
  OptionsController,
  SnackController
} from '@reown/appkit-core-react-native';
import { ConstantsUtil } from '@reown/appkit-common-react-native';
import { FlexView, Link, QrCode, Text, Spacing, Icon } from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';
import { Linking, Pressable } from 'react-native';

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
      <FlexView alignItems="center" margin={['m', 'm', '3xl', 'm']}>
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
      <Pressable onPress={() => Linking.openURL(ConstantsUtil.REOWN_URL)}>
        <FlexView alignItems="center" justifyContent="center" flexDirection="row" columnGap="2xs">
          <Text variant="small-500" color="fg-100">
            UX by
          </Text>
          <Icon name="reown" color="fg-150" width={100} height={30} />
        </FlexView>
      </Pressable>
    </FlexView>
  );
}
