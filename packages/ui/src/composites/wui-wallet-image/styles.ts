import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  xsImage: {
    height: 15,
    width: 15,
    borderRadius: BorderRadius['4xs']
  },
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
    height: 90,
    width: 90,
    borderRadius: BorderRadius.m
  },
  border: {
    borderWidth: 1,
    position: 'absolute'
  }
});
