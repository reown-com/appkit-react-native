import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.l,
    padding: Spacing.l,
    alignSelf: 'center'
  },
  icon: {
    position: 'absolute'
  }
});
