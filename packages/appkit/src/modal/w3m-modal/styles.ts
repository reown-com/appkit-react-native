import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  outerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  innerBackdropTouchable: {
    flexGrow: 2
  },
  modal: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  card: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '80%'
  }
});
