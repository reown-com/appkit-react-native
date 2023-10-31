import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignSelf: 'center'
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: Spacing['2xs'],
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.s
  },
  emptyContainer: {
    height: '100%'
  }
});
