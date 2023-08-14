import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xxs,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
  },
  base: {
    position: 'absolute',
    zIndex: 10
  },
  top: {
    bottom: -3
  },
  bottom: {
    top: -3,
    transform: [{ rotateZ: '180deg' }]
  },
  right: {
    left: -8,
    transform: [{ rotateZ: '90deg' }]
  },
  left: {
    right: -8,
    transform: [{ rotateZ: '90deg' }, { rotateX: '180deg' }]
  }
});
