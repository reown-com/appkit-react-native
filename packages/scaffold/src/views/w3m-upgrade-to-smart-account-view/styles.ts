import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    marginTop: Spacing.xl,
    marginVertical: Spacing.s
  },
  button: {
    width: 110
  },
  cancelButton: {
    marginRight: Spacing.m
  },
  middleIcon: {
    marginHorizontal: Spacing.s
  },
  closeButton: {
    alignSelf: 'flex-end',
    right: Spacing.xl,
    top: Spacing.l,
    position: 'absolute',
    zIndex: 2
  }
});
