import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    minHeight: 250,
    maxHeight: 600,
    paddingTop: Spacing.l,
    paddingBottom: Spacing['2xl'],
    marginHorizontal: Spacing.m
  },
  title: {
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs
  }
});
