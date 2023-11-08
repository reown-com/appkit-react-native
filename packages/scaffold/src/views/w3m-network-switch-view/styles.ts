import { StyleSheet } from 'react-native';
import { Spacing } from '@web3modal/ui-react-native';

export default StyleSheet.create({
  descriptionText: {
    marginHorizontal: Spacing['3xl']
  },
  errorIcon: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    zIndex: 2
  },
  retryButton: {
    marginTop: Spacing.xl
  },
  retryIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  text: {
    marginVertical: Spacing.xs
  }
});
