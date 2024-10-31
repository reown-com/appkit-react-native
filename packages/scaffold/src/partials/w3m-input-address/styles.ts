import { StyleSheet } from 'react-native';
import { BorderRadius } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
    borderRadius: BorderRadius.s,
    borderWidth: StyleSheet.hairlineWidth
  },
  input: {
    fontSize: 18
  }
});
