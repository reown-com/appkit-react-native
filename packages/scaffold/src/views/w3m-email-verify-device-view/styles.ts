import { Spacing } from '@reown/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  iconContainer: {
    height: 64,
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.xl,
    marginBottom: Spacing['2xl']
  },
  headingText: {
    marginBottom: Spacing.s
  },
  expiryText: {
    marginVertical: Spacing.l
  }
});
