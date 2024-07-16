import { StyleSheet } from 'react-native';
import { FlexView, Spacing, Text } from '@web3modal/ui-react-native';

export interface ConnectingBodyProps {
  errorType?: 'linking' | 'default';
  wcError?: boolean;
  walletName?: string;
}

export function ConnectingBody({ errorType, wcError, walletName = 'Wallet' }: ConnectingBodyProps) {
  if (errorType === 'linking') {
    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500">App not installed</Text>
      </FlexView>
    );
  } else if (errorType === 'default') {
    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500">Connection error</Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          There was an unexpected connection error.
        </Text>
      </FlexView>
    );
  } else if (wcError) {
    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500" color="error-100">
          Connection declined
        </Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Connection can be declined if a previous request is still active
        </Text>
      </FlexView>
    );
  }

  return (
    <FlexView padding={['3xs', '2xl', '0', '2xl']} alignItems="center" style={styles.textContainer}>
      <Text variant="paragraph-500">{`Continue in ${walletName}`}</Text>
      <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
        Accept connection request in the wallet
      </Text>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    marginVertical: Spacing.xs
  },
  descriptionText: {
    marginTop: Spacing.xs,
    marginHorizontal: Spacing['3xl']
  }
});
