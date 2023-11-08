import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export const ITEM_HEIGHT = 96;

export default StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    width: 76,
    borderRadius: BorderRadius.xs
  },
  text: {
    marginTop: Spacing.xs
  }
});
