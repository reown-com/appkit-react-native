import { type StyleProp, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { ButtonType, ThemeKeys } from '../../utils/TypesUtil';

export const getThemedButtonStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: ButtonType,
  disabled?: boolean,
  pressed?: boolean
): StyleProp<any> => {
  const buttonBaseStyle = {
    borderColor: theme['gray-glass-010']
  };

  if (disabled) {
    return {
      backgroundColor: variant === 'fill' ? theme['gray-glass-020'] : theme['gray-glass-010'],
      borderColor: theme['gray-glass-005']
    };
  }

  if (pressed) {
    return {
      ...buttonBaseStyle,
      backgroundColor: variant === 'fill' ? theme['accent-020'] : theme['gray-glass-010']
    };
  }

  return {
    ...buttonBaseStyle,
    backgroundColor: variant === 'fill' ? theme['accent-100'] : 'transparent'
  };
};

export const getThemedTextStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: ButtonType,
  disabled?: boolean
): StyleProp<any> => {
  if (disabled) {
    return variant === 'fill' ? { color: theme['fg-300'] } : { color: theme['gray-glass-020'] };
  }

  return variant === 'fill'
    ? { color: theme['inverse-100'] }
    : variant === 'accent'
    ? { color: theme['accent-100'] }
    : { color: theme['fg-150'] };
};

export default StyleSheet.create({
  button: {
    paddingVertical: Spacing['3xs'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.s,
    borderWidth: 1
  },
  smButton: {
    height: 32,
    paddingHorizontal: Spacing['2xs']
  },
  mdButton: {
    height: 40,
    paddingHorizontal: Spacing.xs
  },
  text: {
    marginHorizontal: Spacing['3xs']
  },
  iconRight: {
    marginRight: Spacing['3xs']
  },
  iconLeft: {
    marginLeft: Spacing['3xs']
  }
});
