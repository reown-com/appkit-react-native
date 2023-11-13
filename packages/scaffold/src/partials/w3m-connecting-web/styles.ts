import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  openButton: {
    marginTop: Spacing.m
  },
  copyButton: {
    marginTop: Spacing.m
  },
  mainText: {
    marginTop: Spacing.s,
    marginBottom: Spacing.xs
  },
  descriptionText: {
    marginBottom: Spacing.xs,
    marginHorizontal: Spacing['3xl']
  },
  errorIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 2
  },
  marginBottom: {
    marginBottom: Spacing.xs
  }
});
