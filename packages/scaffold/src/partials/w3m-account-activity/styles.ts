import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: Spacing.xs
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
  loader: {
    flex: 1
  },
  loadMoreButton: {
    alignSelf: 'center',
    width: 100,
    marginVertical: Spacing.xs
  }
});
