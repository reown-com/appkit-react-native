import { type StyleProp, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { ThemeKeys } from '../../utils/TypesUtil';

export const getThemedButtonStyle = (
  theme: { [key in ThemeKeys]: string },
  loading?: boolean,
  pressed?: boolean
): StyleProp<any> => {
  const buttonBaseStyle = {
    borderColor: theme['gray-glass-010']
  };

  if (loading) {
    return {
      backgroundColor: theme['gray-glass-015'],
      borderColor: theme['gray-glass-005']
    };
  }

  if (pressed) {
    return {
      ...buttonBaseStyle,
      backgroundColor: theme['accent-020']
    };
  }

  return {
    ...buttonBaseStyle,
    backgroundColor: theme['accent-100']
  };
};

export const getThemedTextStyle = (
  theme: { [key in ThemeKeys]: string },
  loading?: boolean
): StyleProp<any> => {
  if (loading) {
    return { color: theme['accent-100'] };
  }

  return { color: theme['inverse-100'] };
};

export default StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 40,
    paddingVertical: Spacing['3xs'],
    paddingHorizontal: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.s,
    borderWidth: 1
  },
  smButton: {
    height: 32
  },
  mdButton: {
    height: 40
  },
  loader: {
    marginRight: Spacing['2xs']
  }
});
