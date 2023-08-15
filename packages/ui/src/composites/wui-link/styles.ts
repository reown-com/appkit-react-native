import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  smContainer: {
    flexDirection: 'row',
    height: 24,
    paddingHorizontal: Spacing['3xs'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius['3xs']
  },
  mdContainer: {
    flexDirection: 'row',
    height: 28,
    paddingHorizontal: Spacing['2xs'],
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius['3xs']
  },
  padding: {
    paddingHorizontal: Spacing['4xs']
  }
});
