import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { ThemeKeys } from '../../utils/TypesUtil';

export const getBackgroundColor = ({
  selected,
  disabled,
  pressed
}: {
  selected?: boolean;
  disabled?: boolean;
  pressed?: boolean;
}): ThemeKeys => {
  if (disabled) return 'overlay-005';
  if (selected) return 'blue-020';

  return pressed ? 'overlay-010' : 'overlay-002';
};

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 96,
    width: 76,
    borderRadius: BorderRadius.xs
  },
  text: {
    marginTop: Spacing.xs
  },
  disabledImage: {
    opacity: 0.4
  }
});
