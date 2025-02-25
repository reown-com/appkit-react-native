import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  selectButton: {
    height: 40,
    paddingHorizontal: Spacing.m
  },
  container: {
    height: 40
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing['2xs']
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    marginRight: 0
  },
  imageInverse: {
    marginRight: 0,
    marginLeft: Spacing['2xs']
  },
  clipContainer: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    zIndex: 1
  },
  chevron: {
    marginLeft: Spacing['2xs']
  }
});
