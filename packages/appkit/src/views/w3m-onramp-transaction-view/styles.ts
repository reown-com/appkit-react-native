import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  icon: {
    marginBottom: Spacing.m
  },
  card: {
    borderRadius: BorderRadius.s
  },
  tokenImage: {
    height: 16,
    width: 16,
    marginLeft: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1
  }
});
