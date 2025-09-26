import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    paddingBottom: Spacing['xs'],
    minHeight: '30%'
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
