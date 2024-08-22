import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    top: Spacing.l,
    left: Spacing.xl
  },
  closeIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    top: Spacing.l,
    right: Spacing.xl
  },
  copyButton: {
    marginLeft: Spacing['4xs']
  },
  actionButton: {
    marginBottom: Spacing.xs
  },
  upgradeButton: {
    marginBottom: Spacing.s
  }
});
