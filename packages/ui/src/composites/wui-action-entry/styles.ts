import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xs
  },
  label: {
    marginHorizontal: Spacing['4xs']
  },
  icon: {
    marginRight: Spacing.xs
  }
});
