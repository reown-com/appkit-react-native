import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    borderRadius: BorderRadius.l,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden'
  }
});
