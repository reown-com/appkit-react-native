import { StyleSheet } from 'react-native';
import { BorderRadius, WalletImageSize } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  image: {
    height: WalletImageSize.sm,
    width: WalletImageSize.sm,
    borderRadius: BorderRadius.full
  }
});
