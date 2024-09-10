import { Spacing } from '@reown/ui-react-native';
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
  errorIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  }
});
