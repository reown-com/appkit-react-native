import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    padding: Spacing.xs,
    borderRadius: BorderRadius['3xs'],
    alignItems: 'center',
    justifyContent: 'center'
  }
});
