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
    borderColor: theme['overlay-010']
  };

  if (disabled) {
    return {
      backgroundColor: variant === 'fill' ? theme['overlay-020'] : theme['overlay-010'],
      borderColor: theme['overlay-005']
    };
  }

  if (pressed) {
    return {
      ...buttonBaseStyle,
      backgroundColor: variant === 'fill' ? theme['blue-080'] : theme['overlay-010']
    };
  }

  return {
    ...buttonBaseStyle,
    backgroundColor: variant === 'fill' ? theme['blue-100'] : 'transparent'
  };
};

export const getThemedTextStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: ButtonType,
  disabled?: boolean
): StyleProp<any> => {
  if (disabled) {
    return variant === 'fill' ? { color: theme['fg-300'] } : { color: theme['overlay-020'] };
  }

  return variant === 'fill'
    ? { color: theme['inverse-100'] }
    : variant === 'accent'
    ? { color: theme['blue-100'] }
    : { color: theme['fg-150'] };
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
  iconLeft: {
    marginRight: Spacing['2xs']
  },
  iconRight: {
    marginLeft: Spacing['2xs']
  }
});
