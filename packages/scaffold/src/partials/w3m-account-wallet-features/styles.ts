import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  balanceText: {
    fontSize: 40,
    fontWeight: '500'
  },
  actionsContainer: {
    width: '100%',
    marginTop: Spacing.s,
    marginBottom: Spacing.l
  },
  action: {
    flex: 1,
    height: 52
  }
});
