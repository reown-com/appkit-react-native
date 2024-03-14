import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  iconContainer: {
    padding: Spacing['2xl'],
    borderRadius: Spacing['2xl'],
    marginBottom: Spacing.l
  },
  emailText: {
    fontWeight: 'bold'
  },
  expiryText: {
    marginVertical: Spacing.l
  }
});
