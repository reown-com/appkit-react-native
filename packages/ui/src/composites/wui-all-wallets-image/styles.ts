import { StyleSheet } from 'react-native';
import { BorderRadius } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius.xxs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  icon: {
    margin: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
