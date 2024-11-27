import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    minHeight: 250,
    maxHeight: 600
  },
  title: {
    paddingTop: Spacing.s,
    paddingBottom: Spacing.xs
  },
  tokenList: {
    paddingHorizontal: Spacing.m
  }
});
