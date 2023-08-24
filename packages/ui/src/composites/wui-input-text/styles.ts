import { StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

const baseStyle = {
  flexDirection: 'row',
  height: 40,
  width: '100%',
  borderRadius: BorderRadius.xxs,
  alignItems: 'center',
  paddingHorizontal: Spacing.m,
  borderWidth: 1
} as ViewStyle;

export default StyleSheet.create({
  smContainer: {
    ...baseStyle
  },
  mdContainer: {
    ...baseStyle,
    height: 56,
    paddingHorizontal: Spacing.l
  },
  outerBorder: {
    borderWidth: 4,
    borderRadius: BorderRadius.xs,
    borderColor: 'transparent'
  },
  input: {
    width: 'auto',
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
