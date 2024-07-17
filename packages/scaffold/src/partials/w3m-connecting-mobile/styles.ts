import { StyleSheet } from 'react-native';
import { Spacing } from '@web3modal/ui-react-native';

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
  errorIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  }
});
