import { StyleSheet } from 'react-native';
import { BorderRadius } from '@web3modal/ui-react-native';

export default StyleSheet.create({
  container: {
    bottom: 0,
    position: 'absolute'
  },
  visible: {
    width: '100%',
    height: '80%'
  },
  hidden: {
    display: 'none'
  },
  webview: {
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l
  }
});
