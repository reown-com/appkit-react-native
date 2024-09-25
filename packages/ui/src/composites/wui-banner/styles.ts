import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    padding: Spacing.s,
    borderRadius: BorderRadius.s
  },
  icon: {
    marginRight: Spacing.xs
  },
  text: {
    flex: 1
  }
});
