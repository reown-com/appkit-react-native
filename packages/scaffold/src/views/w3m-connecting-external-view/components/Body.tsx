import { StyleSheet } from 'react-native';
import { FlexView, Spacing, Text } from '@web3modal/ui-react-native';

export interface ConnectingBodyProps {
  connectionError?: boolean;
  installedError?: boolean;
  walletName?: string;
}

const getErrorMessage = (connectionError?: boolean, installedError?: boolean) => {
  if (connectionError) {
    return {
      title: 'Connection declined',
      description: 'Connection can be declined if a previous request is still active'
    };
  }

  if (installedError) {
    return { title: 'App not installed' };
  }

  return undefined;
};

export function ConnectingBody({
  connectionError,
  installedError,
  walletName = 'Wallet'
}: ConnectingBodyProps) {
  const error = getErrorMessage(connectionError, installedError);

  if (error) {
    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500">{error.title}</Text>
        {error.description && (
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            {error.description}
          </Text>
        )}
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
