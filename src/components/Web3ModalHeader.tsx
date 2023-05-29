import {
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import WCLogo from '../assets/WCLogo.png';
import Close from '../assets/Close.png';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Web3ModalHeaderProps {
  onClose: () => void;
}

export function Web3ModalHeader({ onClose }: Web3ModalHeaderProps) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.wcLogo} source={WCLogo} />
      <TouchableOpacity
        style={[styles.closeContainer, isDarkMode && styles.closeContainerDark]}
        onPress={onClose}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Image
          style={[styles.closeImage, isDarkMode && styles.closeImageDark]}
          source={Close}
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
  wcLogo: {
    width: 181,
    height: 28,
  },
  closeImage: {
    width: 12,
    height: 12,
    tintColor: 'black',
  },
  closeImageDark: {
    tintColor: 'white',
  },
  closeContainer: {
    height: 28,
    width: 28,
    backgroundColor: LightTheme.background1,
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeContainerDark: {
    backgroundColor: DarkTheme.background1,
  },
});

export default Web3ModalHeader;
