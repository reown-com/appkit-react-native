import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { ThemeKeys } from '../../utils/TypesUtil';

export const ITEM_HEIGHT = 96;
export const ITEM_WIDTH = 76;

export const getBackgroundColor = ({
  selected,
  disabled,
  pressed
}: {
  selected?: boolean;
  disabled?: boolean;
  pressed?: boolean;
}): ThemeKeys => {
  if (disabled) return 'gray-glass-005';
  if (selected) return 'accent-glass-020';

  return pressed ? 'gray-glass-010' : 'gray-glass-002';
};

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    width: ITEM_WIDTH,
    borderRadius: BorderRadius.xs
  },
  text: {
    marginTop: Spacing.xs,
    marginHorizontal: Spacing['2xs']
  },
  disabledImage: {
    opacity: 0.4
  }
});
