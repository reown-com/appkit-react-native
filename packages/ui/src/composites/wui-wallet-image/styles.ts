import { StyleSheet } from 'react-native';
import { BorderRadius, WalletImageSize } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  xsImage: {
    height: WalletImageSize.xs,
    width: WalletImageSize.xs,
    borderRadius: BorderRadius['4xs']
  },
  smImage: {
    height: WalletImageSize.sm,
    width: WalletImageSize.sm,
    borderRadius: BorderRadius.xxs
  },
  mdImage: {
    height: WalletImageSize.md,
    width: WalletImageSize.md,
    borderRadius: BorderRadius.xs
  },
  lgImage: {
    height: WalletImageSize.lg,
    width: WalletImageSize.lg,
    borderRadius: BorderRadius.s
  },
  xlImage: {
    height: WalletImageSize.xl,
    width: WalletImageSize.xl,
    borderRadius: BorderRadius.m
  },
  border: {
    borderWidth: StyleSheet.hairlineWidth,
    position: 'absolute'
  }
});
