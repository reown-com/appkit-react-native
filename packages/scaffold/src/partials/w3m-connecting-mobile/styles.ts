import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  retryButton: {
    marginTop: Spacing.xs
  },
  copyButton: {
    marginVertical: Spacing.xs
  },
  retryIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  descriptionText: {
    marginHorizontal: Spacing['3xl']
  },
  errorIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  },
  storeButton: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl']
  }
});
