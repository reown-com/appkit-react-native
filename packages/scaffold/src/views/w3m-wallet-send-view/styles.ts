import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  sendButton: {
    width: '100%',
    marginTop: Spacing.xl
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
  }
});
