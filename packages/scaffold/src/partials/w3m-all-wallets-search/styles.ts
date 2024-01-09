import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: '100%'
  },
  contentContainer: {
    paddingBottom: Spacing['2xl']
  },
  emptyContainer: {
    height: '100%',
    paddingTop: '50%'
  },
  emptyLandscape: {
    paddingTop: '10%'
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs
  },
  text: {
    marginTop: Spacing.xs
  }
});
