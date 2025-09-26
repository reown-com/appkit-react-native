import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 100,
    width: '100%',
    borderRadius: BorderRadius.s,
    borderWidth: StyleSheet.hairlineWidth
  },
  input: {
    fontSize: 32,
    flex: 1,
    marginRight: Spacing.xs
  },
  sendValue: {
    flex: 1,
    marginRight: Spacing.xs
  },
  inputLoading: {
    marginBottom: Spacing.xs
  }
});
