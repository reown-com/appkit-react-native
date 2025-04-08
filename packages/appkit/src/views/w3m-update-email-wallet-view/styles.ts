import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emailInput: {
    marginBottom: Spacing.s
  },
  cancelButton: {
    flex: 1,
    height: 48,
    marginRight: Spacing['2xs'],
    borderRadius: BorderRadius.xs
  },
  saveButton: {
    flex: 1,
    height: 48,
    marginLeft: Spacing['2xs'],
    borderRadius: BorderRadius.xs
  }
});
