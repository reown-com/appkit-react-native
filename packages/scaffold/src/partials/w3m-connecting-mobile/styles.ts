import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  retryButton: {
    marginTop: Spacing['2xs']
  },
  copyButton: {
    marginVertical: Spacing.xs
  },
  storeButton: {
    width: '95%'
  },
  copyIcon: {
    transform: [{ rotateY: '180deg' }]
  }
});
