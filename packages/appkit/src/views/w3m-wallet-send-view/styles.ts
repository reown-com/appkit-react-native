import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  sendButton: {
    width: '100%',
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.xs
  },
  tokenInput: {
    marginBottom: Spacing.xs
  },
  arrowIcon: {
    position: 'absolute',
    top: -30,
    borderRadius: BorderRadius.s
  },
  addressContainer: {
    width: '100%'
  },
  withKeyboard: {
    height: '100%'
  }
});
