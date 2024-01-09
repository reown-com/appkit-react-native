import { type StyleProp, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { ChipType, ThemeKeys } from '../../utils/TypesUtil';

export const getThemedChipStyle = (
  theme: { [key in ThemeKeys]: string },
  variant: ChipType,
  disabled?: boolean,
  pressed?: boolean
): StyleProp<any> => {
  const chipBaseStyle = {
    borderColor: theme['gray-glass-010']
  };

  if (disabled) {
    return {
      backgroundColor: theme['gray-glass-020'],
      borderColor: theme['gray-glass-005']
    };
  }

  if (pressed) {
    return {
      ...chipBaseStyle,
      backgroundColor:
        variant === 'fill'
          ? theme['accent-020']
          : variant === 'shade'
          ? theme['gray-glass-020']
          : theme['gray-glass-010']
    };
  }

  return {
    ...chipBaseStyle,
    backgroundColor:
      variant === 'fill'
        ? theme['accent-100']
        : variant === 'shade'
        ? theme['gray-glass-010']
        : 'transparent'
  };
};

export const getThemedTextColor = (
  variant: ChipType,
  disabled?: boolean,
  pressed?: boolean
): ThemeKeys => {
  if (disabled) {
    return 'fg-300';
  }

  if (pressed) {
    return variant === 'fill' ? 'inverse-100' : variant === 'shade' ? 'fg-175' : 'fg-150';
  }

  return variant === 'fill' ? 'inverse-100' : variant === 'shade' ? 'fg-200' : 'fg-150';
};

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.s,
    borderWidth: 1
  },
  image: {
    borderRadius: 100,
    borderWidth: 1
  },
  smImage: {
    width: 16,
    height: 16
  },
  mdImage: {
    width: 24,
    height: 24
  },
  disabledImage: {
    opacity: 0.2
  },
  smChip: {
    height: 32
  },
  mdChip: {
    height: 40
  },
  link: {
    paddingHorizontal: Spacing.xs
  },
  icon: {
    paddingRight: Spacing['3xs']
  }
});
