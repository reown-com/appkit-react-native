import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  bottomInputContainer: {
    width: '100%'
  },
  arrowIcon: {
    position: 'absolute',
    top: -30,
    borderRadius: BorderRadius.s
  },
  tokenInput: {
    marginBottom: Spacing.xs
  }
});
