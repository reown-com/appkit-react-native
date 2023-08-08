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
    borderWidth: 4,
    height: 106,
    width: 106,
    borderRadius: 36
  }
});
