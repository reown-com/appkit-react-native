import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/CopyLarge';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import type { RouterProps } from '../types/routerTypes';
import { ThemeCtrl } from '../controllers/ThemeCtrl';
import useTheme from '../hooks/useTheme';
import { ToastCtrl } from '../controllers/ToastCtrl';

function QRCodeView({
  onCopyClipboard,
  isPortrait,
  windowHeight,
  windowWidth,
}: RouterProps) {
  const Theme = useTheme();
  const themeState = useSnapshot(ThemeCtrl.state);
  const { pairingUri } = useSnapshot(WcConnectionCtrl.state);

  const onCopy = async () => {
    if (onCopyClipboard && pairingUri) {
      onCopyClipboard(pairingUri);
      ToastCtrl.openToast('Link copied', 'success');
    }
  };

  return (
    <View style={[styles.container]}>
      <NavHeader
        title="Scan the code"
        onBackPress={RouterCtrl.goBack}
        actionIcon={CopyIcon}
        onActionPress={onCopyClipboard ? onCopy : undefined}
        actionDisabled={!pairingUri}
      />
      {pairingUri ? (
        <QRCode
          uri={pairingUri}
          size={isPortrait ? windowWidth * 0.9 : windowHeight * 0.6}
          theme={themeState.themeMode}
        />
      ) : (
        <ActivityIndicator
          style={{
            height: isPortrait ? windowWidth * 0.9 : windowHeight * 0.6,
          }}
          color={Theme.accent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
});

export default QRCodeView;
