import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  'container': {
    padding: Spacing.xs,
    borderRadius: BorderRadius.xxs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  'container-sm': {},
  'container-md': {
    height: 32,
    width: 32
  },
  'container-lg': {
    height: 40,
    width: 40
  }
});
