import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    minHeight: '30%'
  },
  openButton: {
    marginTop: Spacing.m
  },
  copyButton: {
    marginTop: Spacing.m
  },
  errorIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  },
  marginBottom: {
    marginBottom: Spacing.xs
  }
});
