import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  networkIcon: {
    alignSelf: 'flex-start',
    position: 'absolute',
    zIndex: 1,
    top: Spacing.l,
    left: Spacing.l
  },
  closeIcon: {
    alignSelf: 'flex-end',
    position: 'absolute',
    zIndex: 1,
    top: Spacing.l,
    right: Spacing.xl
  },
  accountPill: {
    alignSelf: 'center',
    marginBottom: Spacing.s,
    marginHorizontal: Spacing.s
  }
});
