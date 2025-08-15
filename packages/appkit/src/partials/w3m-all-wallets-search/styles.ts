import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    paddingBottom: Spacing['2xl']
  },
  placeholderContainer: {
    flex: 0,
    height: '90%'
  },
  emptyContainer: {
    flex: 0,
    height: '90%'
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
