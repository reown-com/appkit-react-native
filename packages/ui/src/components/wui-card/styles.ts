import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    display: 'flex',
    padding: Spacing.xl,
    borderRadius: BorderRadius.l,
    borderWidth: 1,
    overflow: 'hidden'
  }
});
