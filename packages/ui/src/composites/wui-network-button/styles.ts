import { StyleSheet } from 'react-native';
import { Spacing } from '../../utils/ThemeUtil';

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
  children: {
    paddingHorizontal: Spacing['2xs']
  },
  loader: {
    paddingLeft: Spacing['2xs']
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
