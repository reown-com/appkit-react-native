import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    width: '100%',
    padding: Spacing.s,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.s
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full
  },
  disabledLogo: {
    opacity: 0.4
  },
  border: {
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
