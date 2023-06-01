import {
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

import WCLogo from '../assets/LogoLockup';
import CloseIcon from '../assets/Close';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Web3ModalHeaderProps {
  onClose: () => void;
}

export function Web3ModalHeader({ onClose }: Web3ModalHeaderProps) {
  const Theme = useColorScheme() === 'dark' ? DarkTheme : LightTheme;

  return (
    <SafeAreaView style={styles.container}>
      <SvgXml xml={WCLogo} width={181} height={28} fill="white" />
      <TouchableOpacity
        style={[styles.closeContainer, { backgroundColor: Theme.background1 }]}
        onPress={onClose}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <SvgXml
          xml={CloseIcon}
          height={12}
          width={12}
          fill={Theme.foreground1}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  closeContainer: {
    height: 28,
    width: 28,
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        borderColor: 'rgba(0, 0, 0, 0.12)',
        borderWidth: 1,
        elevation: 4,
      },
    }),
  },
});

export default Web3ModalHeader;
