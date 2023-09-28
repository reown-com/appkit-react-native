import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 110,
    width: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    position: 'absolute'
  },
  error: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    zIndex: 2
  }
});
