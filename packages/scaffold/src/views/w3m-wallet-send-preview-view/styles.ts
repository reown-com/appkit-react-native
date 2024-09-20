import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  tokenLogo: {
    height: 32,
    width: 32,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs
  },
  arrow: {
    marginVertical: Spacing.xs
  },
  avatar: {
    marginLeft: Spacing.xs
  },
  details: {
    marginTop: Spacing['2xl']
  }
});
