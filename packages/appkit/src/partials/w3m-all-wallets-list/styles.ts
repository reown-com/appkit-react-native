import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
  },
  errorContainer: {
    height: '90%'
  },
  placeholderContainer: {
    flex: 0,
    height: '90%'
  }
});
