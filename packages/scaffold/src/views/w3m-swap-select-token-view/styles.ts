import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    minHeight: 250,
    maxHeight: 600
  },
  title: {
    paddingTop: Spacing['2xs']
  },
  tokenList: {
    paddingHorizontal: Spacing.m
  },
  input: {
    marginHorizontal: Spacing.xs
  },
  suggestedList: {
    marginTop: Spacing.xs
  },
  suggestedListContent: {
    paddingHorizontal: Spacing.s
  },
  suggestedToken: {
    marginRight: Spacing.s
  },
  suggestedSeparator: {
    marginVertical: Spacing.s
  }
});
