import { StyleSheet } from 'react-native';
import { Spacing } from '@web3modal/ui-react-native';
import { AccountActivity } from '../../partials/w3m-account-activity';

export function TransactionsView() {
  return <AccountActivity style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.l,
    marginVertical: Spacing.s,
    marginBottom: Spacing.l
  }
});
