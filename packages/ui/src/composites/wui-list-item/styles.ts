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
    alignItems: 'center'
  },
  imageContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full
  },
  disabledImage: {
    opacity: 0.4
  },
  rightIcon: {
    marginRight: Spacing['2xs']
  }
});
