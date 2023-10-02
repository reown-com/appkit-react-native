import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    paddingBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xs,
    alignItems: 'center'
  },
  loader: {
    height: '100%',
    flexGrow: 1
  },
  pageLoader: {
    marginTop: Spacing.xl
  }
});
