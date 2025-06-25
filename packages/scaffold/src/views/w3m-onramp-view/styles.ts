import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  continueButton: {
    marginLeft: Spacing.m,
    flex: 3
  },
  cancelButton: {
    flex: 1
  },
  currencyInput: {
    marginBottom: Spacing.m
  },
  providerImage: {
    height: 16,
    width: 16,
    marginRight: 2
  },
  networkImage: {
    height: 14,
    width: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1
  }
});
