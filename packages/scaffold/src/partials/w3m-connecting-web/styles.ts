import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  openButton: {
    marginTop: Spacing.xs
  },
  copyButton: {
    marginVertical: Spacing.xs
  },
  descriptionText: {
    marginHorizontal: Spacing['3xl']
  },
  errorIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    zIndex: 2
  }
});
