import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: '65%'
  },
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 8,
    alignItems: 'center'
  },
  header: {
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 6 }
      }
    })
  }
});
