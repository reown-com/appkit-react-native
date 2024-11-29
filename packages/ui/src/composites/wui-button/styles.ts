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
    borderColor: theme['gray-glass-020']
  };

  if (disabled) {
    return {
      backgroundColor: variant === 'fill' ? theme['gray-glass-005'] : theme['gray-glass-010']
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
    backgroundColor: variant === 'fill' ? theme['accent-100'] : theme['gray-glass-002']
  };
};

export const getThemedTextStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: ButtonType,
  disabled?: boolean
): StyleProp<any> => {
  if (disabled) {
    return { color: theme['gray-glass-020'] };
  }

  return variant === 'fill'
    ? { color: theme['inverse-100'] }
    : variant === 'accent'
    ? { color: theme['accent-100'] }
    : { color: theme['fg-100'] };
};

export const getIconColor = (variant: ButtonType, disabled?: boolean) => {
  if (disabled) {
    return 'gray-glass-020';
  }

  return variant === 'fill' ? 'inverse-100' : variant === 'accent' ? 'accent-100' : 'fg-100';
};

export default StyleSheet.create({
  button: {
    paddingVertical: Spacing['3xs'],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xs,
    borderWidth: StyleSheet.hairlineWidth
  },
  smButton: {
    height: 32,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius['3xl']
  },
  mdButton: {
    height: 48,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.s
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
