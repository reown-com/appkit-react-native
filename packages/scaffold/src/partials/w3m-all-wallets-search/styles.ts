import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    height: '100%',
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xs,
    alignItems: 'center'
  },
  emptyContainer: {
    height: '50%'
  }
});
