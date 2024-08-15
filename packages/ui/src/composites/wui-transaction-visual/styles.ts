import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  image: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.s
  },
  imageNft: {
    borderRadius: BorderRadius.xxs
  },
  halfContainer: {
    overflow: 'hidden',
    width: 20,
    marginRight: 2
  },
  halfRight: {
    left: -20
  },
  networkImageContainer: {
    position: 'absolute',
    bottom: -2,
    left: 24,
    borderWidth: 2,
    borderRadius: BorderRadius.full,
    width: 18,
    height: 18
  },
  networkImage: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full
  }
});
