import { StyleSheet, type ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

const baseStyle = {
  flexDirection: 'row',
  height: 40,
  borderRadius: BorderRadius.xxs,
  alignItems: 'center',
  paddingHorizontal: Spacing.xs,
  borderWidth: StyleSheet.hairlineWidth
} as ViewStyle;

export const outerBorderRadius = {
  xs: BorderRadius.s,
  sm: BorderRadius.xs,
  md: BorderRadius.s
};

export default StyleSheet.create({
  // Used for numeric input
  xsContainer: {
    ...baseStyle,
    borderRadius: BorderRadius.xs,
    height: 50,
    width: 50
  },
  smContainer: {
    ...baseStyle
  },
  mdContainer: {
    ...baseStyle,
    height: 56,
    borderRadius: BorderRadius.xs
  },
  outerBorder: {
    flexGrow: 1,
    borderWidth: 4,
    borderRadius: BorderRadius.xs,
    borderColor: 'transparent'
  },
  input: {
    flex: 1,
    marginHorizontal: Spacing['4xs'],
    fontSize: 16,
    fontWeight: '400'
  },
  icon: {
    marginLeft: Spacing['3xs'],
    marginRight: Spacing.xs
  }
});
