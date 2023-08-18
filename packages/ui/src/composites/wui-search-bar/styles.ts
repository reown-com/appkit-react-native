import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    width: '100%',
    borderRadius: BorderRadius.xxs,
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    borderWidth: 1
  },
  focusedBorder: {
    borderWidth: 4,
    borderRadius: BorderRadius.xs,
    borderColor: 'transparent'
  },
  input: {
    width: 'auto',
    flexGrow: 1,
    marginHorizontal: Spacing['4xs']
  },
  searchIcon: {
    marginRight: Spacing.xs
  },
  text: {
    fontSize: 16,
    fontWeight: '500'
  }
});
