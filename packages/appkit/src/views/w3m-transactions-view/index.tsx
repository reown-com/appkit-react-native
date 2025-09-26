import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';
import { AccountActivity } from '../../partials/w3m-account-activity';

export function TransactionsView() {
  return <AccountActivity style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.l,
    marginTop: Spacing.s
  }
});
