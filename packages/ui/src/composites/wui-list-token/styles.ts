import { StyleSheet } from 'react-native';
import { BorderRadius, WalletImageSize } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  pressable: {
    borderRadius: BorderRadius.s
  },
  image: {
    height: WalletImageSize.sm,
    width: WalletImageSize.sm,
    borderRadius: BorderRadius.full
  },
  networkImageContainer: {
    position: 'absolute',
    bottom: -2,
    left: 24,
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    width: 18,
    height: 18
  },
  networkImage: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full
  }
});
