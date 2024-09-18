import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xs
  },
  contentContainer: {
    paddingBottom: Spacing.m
  },
  separatorText: {
    marginVertical: Spacing.xs
  },
  transactionItem: {
    marginVertical: Spacing.xs
  },
  footer: {
    height: 40
  },
  placeholder: {
    minHeight: 200
  },
  loadMoreButton: {
    alignSelf: 'center',
    width: 100,
    marginVertical: Spacing.xs
  }
});
