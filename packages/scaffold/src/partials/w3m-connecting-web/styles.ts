import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  openButton: {
    marginVertical: Spacing.xs
  },
  copyButton: {
    marginVertical: Spacing.xs
  },
  mainText: {
    marginVertical: Spacing.xs
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
