import { StyleSheet, type ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

const baseStyle = {
  flexDirection: 'row',
  height: 40,
  borderRadius: BorderRadius.xxs,
  alignItems: 'center',
  paddingHorizontal: Spacing.m,
  borderWidth: 1
} as ViewStyle;

export default StyleSheet.create({
  xsContainer: {
    ...baseStyle,
    height: 50,
    width: 50
  },
  smContainer: {
    ...baseStyle
  },
  mdContainer: {
    ...baseStyle,
    height: 56,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.xs
  },
  outerBorder: {
    flexGrow: 1,
    borderWidth: 4,
    borderRadius: BorderRadius.xs,
    borderColor: 'transparent'
  },
  input: {
    flexGrow: 1,
    marginHorizontal: Spacing['4xs']
  },
  icon: {
    marginRight: Spacing.xs
  },
  text: {
    fontSize: 16,
    fontWeight: '500'
  }
});
