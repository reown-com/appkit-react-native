import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: '100%'
  },
  contentContainer: {
    paddingBottom: Spacing['2xl']
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs
  },
  pageLoader: {
    marginTop: Spacing.xl
  }
});
