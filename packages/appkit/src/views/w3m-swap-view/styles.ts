import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  bottomInputContainer: {
    width: '100%'
  },
  arrowIcon: {
    position: 'absolute',
    top: -30,
    borderRadius: BorderRadius.xs,
    borderWidth: 4,
    height: 50,
    width: 50
  },
  tokenInput: {
    marginBottom: Spacing.xs
  },
  actionButton: {
    marginTop: Spacing.xs,
    width: '100%'
  },
  modalContent: {
    margin: 0,
    flex: 1,
    justifyContent: 'flex-end'
  },
  withKeyboard: {
    height: '100%'
  }
});
