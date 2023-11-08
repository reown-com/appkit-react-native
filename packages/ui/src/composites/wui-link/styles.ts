import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  smContainer: {
    paddingVertical: Spacing['4xs'],
    paddingHorizontal: Spacing['2xs'],
    borderRadius: BorderRadius['3xs']
  },
  mdContainer: {
    paddingVertical: Spacing['4xs'],
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius['3xs']
  },
  iconRight: {
    marginLeft: Spacing['2xs']
  },
  iconLeft: {
    marginRight: Spacing['2xs']
  }
});
