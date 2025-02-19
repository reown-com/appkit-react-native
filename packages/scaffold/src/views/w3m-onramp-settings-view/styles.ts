import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  itemContent: {
    paddingLeft: 0
  },
  firstItem: {
    marginBottom: Spacing.xs
  },
  image: {
    height: 20,
    width: 20
  },
  imageContainer: {
    borderRadius: BorderRadius.full,
    height: 36,
    width: 36,
    marginRight: Spacing.s
  },
  imageBorder: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden'
  }
});
