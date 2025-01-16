import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center'
  },
  title: {
    marginTop: Spacing.s,
    marginBottom: Spacing.xs
  },
  button: {
    marginTop: Spacing.xl,
    width: '100%'
  }
});
