import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    paddingBottom: Spacing['4xl'],
    paddingTop: Spacing['3xs'],
    gap: Spacing['3xs'],
    alignItems: 'center'
  },
  columnWrapperStyle: {
    justifyContent: 'space-around'
  },
  itemContainer: {
    width: '23%'
  },
  pageLoader: {
    marginTop: Spacing.xl
  },
  errorContainer: {
    height: '90%'
  },
  placeholderContainer: {
    flex: 0,
    height: '90%'
  }
});
