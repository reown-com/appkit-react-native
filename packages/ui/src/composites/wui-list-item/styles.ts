import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    width: '100%',
    padding: Spacing.s,
    alignItems: 'center',
    borderRadius: BorderRadius.xs
  },
  content: {
    flexDirection: 'row',
    flexGrow: 1,
    paddingHorizontal: Spacing.s,
    gap: Spacing['3xs']
  },
  imageContainer: {
    width: 34,
    height: 34,
    borderRadius: 100,
    borderWidth: 2
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 100
  },
  disabledImage: {
    opacity: 0.4
  }
});
