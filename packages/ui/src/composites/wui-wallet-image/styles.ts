import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  smImage: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius.xxs
  },
  mdImage: {
    height: 56,
    width: 56,
    borderRadius: BorderRadius.xs
  },
  lgImage: {
    height: 80,
    width: 80,
    borderRadius: BorderRadius.m
  },
  border: {
    borderWidth: 1,
    position: 'absolute'
  }
});
