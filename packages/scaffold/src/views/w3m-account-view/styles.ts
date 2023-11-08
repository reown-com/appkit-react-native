import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  closeIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    top: 16,
    right: 16
  },
  copyButton: {
    marginLeft: Spacing['4xs']
  },
  disconnectButton: {
    marginTop: Spacing.xs
  }
});
