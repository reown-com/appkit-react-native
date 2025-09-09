import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  backdrop: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modal: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  bottomBackground: {
    flexGrow: 1
  }
});
