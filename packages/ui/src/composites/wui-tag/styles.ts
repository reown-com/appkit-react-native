import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    borderRadius: BorderRadius['5xs'],
    padding: Spacing['2xs']
  },
  text: {
    textTransform: 'uppercase'
  }
});
