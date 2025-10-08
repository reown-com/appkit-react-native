import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  errorIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 2
  },
  continueText: {
    marginTop: Spacing.m,
    marginBottom: Spacing.xs
  }
});
