import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingBottom: Spacing['3xl']
  },
  retryButton: {
    marginTop: Spacing.m
  },
  retryIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  copyButton: {
    alignSelf: 'center',
    marginTop: Spacing.m
  },
  textContainer: {
    marginVertical: Spacing.xs
  },
  descriptionText: {
    marginTop: Spacing.xs,
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
    marginTop: Spacing.l
  }
});
