import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    flex: 1
  },
  content: {
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth
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
