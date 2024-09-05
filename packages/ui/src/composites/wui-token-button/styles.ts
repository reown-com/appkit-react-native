import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    height: 40
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    marginRight: Spacing['2xs']
  }
});
