import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    width: '100%',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xs
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1
  },
  name: {
    marginHorizontal: Spacing['4xs']
  },
  rightIcon: {
    marginHorizontal: Spacing.xs
  },
  image: {
    marginRight: Spacing.xs
  },
  imageDisabled: {
    opacity: 0.4
  }
});
