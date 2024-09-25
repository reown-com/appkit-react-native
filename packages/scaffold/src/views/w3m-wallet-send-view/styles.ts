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
  mockInput: {
    width: '100%',
    borderWidth: 1,
    height: 120,
    borderRadius: 20
  },
  arrowIcon: {
    position: 'absolute',
    top: -30,
    borderRadius: 20
  },
  addressContainer: {
    width: '100%'
  }
});
