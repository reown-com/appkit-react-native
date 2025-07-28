import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  rightImage: {
    height: 64,
    width: 64,
    borderRadius: BorderRadius.full
  },
  itemBorder: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftItemBorder: {
    borderRadius: BorderRadius.full,
    zIndex: 2
  },
  rightItemBorder: {
    borderRadius: 22,
    width: 72,
    height: 72
  }
});
