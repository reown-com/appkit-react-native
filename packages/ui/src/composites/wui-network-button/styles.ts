import { StyleSheet } from 'react-native';
import { Spacing } from '../../utils/ThemeUtil';
import type { ButtonType, ColorType, ThemeKeys } from '../../utils/TypesUtil';

export const getThemedStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: Exclude<ButtonType, 'accent'>,
  pressed: boolean,
  disabled?: boolean
) => {
  if (disabled) {
    return {
      borderColor: theme['gray-glass-005'],
      backgroundColor: theme['gray-glass-020']
    };
  }

  if (pressed) {
    return {
      borderColor: variant === 'fill' ? theme['accent-090'] : theme['gray-glass-010'],
      backgroundColor: variant === 'fill' ? theme['accent-020'] : theme['gray-glass-020']
    };
  }

  return {
    borderColor: theme['gray-glass-010'],
    backgroundColor: variant === 'fill' ? theme['accent-100'] : theme['gray-glass-010']
  };
};

export const getTextColor = (
  variant: Exclude<ButtonType, 'accent'>,
  disabled?: boolean
): ColorType => {
  if (disabled) {
    return 'fg-300';
  }

  if (variant === 'fill') {
    return 'inverse-100';
  }

  return 'fg-100';
};

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: Spacing['2xs']
  },
  text: {
    paddingHorizontal: Spacing['2xs']
  },
  image: {
    height: 24,
    width: 24,
    borderRadius: 100,
    borderWidth: 2,
    paddingLeft: Spacing['4xs']
  },
  imageDisabled: {
    opacity: 0.4
  }
});
