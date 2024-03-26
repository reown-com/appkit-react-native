import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emailInput: {
    marginBottom: Spacing.m
  },
  cancelButton: {
    flex: 1,
    height: 40,
    marginRight: Spacing['2xs']
  },
  saveButton: {
    flex: 1,
    height: 48,
    marginLeft: Spacing['2xs']
  }
});
