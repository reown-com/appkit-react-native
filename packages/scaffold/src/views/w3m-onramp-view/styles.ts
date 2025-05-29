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
  paymentMethodButton: {
    borderRadius: BorderRadius.s,
    height: 64
  },
  paymentMethodImage: {
    width: 22,
    height: 22,
    borderRadius: 0
  },
  paymentMethodImageContainer: {
    width: 40,
    height: 40,
    borderWidth: 0,
    borderRadius: BorderRadius['3xs']
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
