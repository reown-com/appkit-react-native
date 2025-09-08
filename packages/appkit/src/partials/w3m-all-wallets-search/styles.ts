import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    paddingBottom: Spacing['4xl']
  },
  placeholderContainer: {
    flex: 0,
    height: '90%'
  },
  emptyContainer: {
    flex: 0,
    justifyContent: 'flex-start',
    paddingTop: Spacing['4xl'],
    height: '90%'
  },
  emptyLandscape: {
    paddingTop: '10%'
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing['4xs']
  },
  text: {
    marginTop: Spacing.xs
  }
});
