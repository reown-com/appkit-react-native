import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing['2xs']
  },
  children: {
    paddingHorizontal: Spacing['2xs']
  },
  loader: {
    paddingLeft: Spacing['2xs']
  },
  image: {
    height: 24,
    width: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    paddingLeft: Spacing['4xs']
  },
  imageDisabled: {
    opacity: 0.4
  }
});
