import { Spacing, Text } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export interface ConnectingBodyProps {
  wcError?: boolean;
  walletName?: string;
}

export function ConnectingBody({ wcError, walletName = 'Wallet' }: ConnectingBodyProps) {
  if (wcError) {
    return (
      <>
        <Text variant="paragraph-500" style={styles.mainText}>
          Connection declined
        </Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Connection can be declined if a previous request is still active
        </Text>
      </>
    );
  }

  return (
    <>
      <Text variant="paragraph-500" style={styles.mainText}>{`Continue in ${walletName}`}</Text>
      <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
        Open and continue in a browser tab
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  mainText: {
    marginTop: Spacing.s,
    marginBottom: Spacing.xs
  },
  descriptionText: {
    marginBottom: Spacing.xs,
    marginHorizontal: Spacing['3xl']
  }
});
