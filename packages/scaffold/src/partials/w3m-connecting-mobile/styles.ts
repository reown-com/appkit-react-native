import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  retryButton: {
    marginTop: Spacing['2xs']
  },
  copyButton: {
    marginVertical: Spacing.xs
  },
  copyIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  descriptionText: {
    marginHorizontal: Spacing['3xl']
  },
  errorIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    zIndex: 2
  },
  storeButton: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    marginTop: Spacing.xs
  }
});
