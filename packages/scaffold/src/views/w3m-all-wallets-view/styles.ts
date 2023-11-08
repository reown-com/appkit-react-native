import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  header: {
    zIndex: 1,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 6 }
      }
    })
  },
  icon: {
    marginLeft: 8,
    borderWidth: 1
  }
});
