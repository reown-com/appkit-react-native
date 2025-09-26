import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  item: {
    marginVertical: Spacing['3xs']
  },
  socialSeparator: {
    marginVertical: Spacing.xs
  },
  connectWalletButton: {
    justifyContent: 'space-between'
  },
  connectWalletEmpty: {
    height: 20,
    width: 20
  }
});
