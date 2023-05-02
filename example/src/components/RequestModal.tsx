import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import type { IFormattedRpcResponse } from '../types/methods';

interface Props {
  rcpResponse?: IFormattedRpcResponse;
  isVisible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export function RequestModal({
  rcpResponse,
  isVisible,
  onClose,
  isLoading,
}: Props) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onModalHide={onClose}
    >
      <View style={styles.container}>
        {isLoading && (
          <>
            <Text style={styles.title}>Pending JSON-RPC Request</Text>
            <ActivityIndicator color="#3396FF" style={styles.loader} />
            <Text style={styles.center}>
              Approve or reject request using your wallet
            </Text>
          </>
        )}
        {rcpResponse && (
          <>
            <Text style={styles.title}>JSON-RPC Request Response</Text>
            {Object.keys(rcpResponse).map((key) => (
              <Text key={key} style={styles.subtitle}>
                {key}:{' '}
                <Text style={styles.responseText}>
                  {rcpResponse[key as keyof IFormattedRpcResponse]?.toString()}
                </Text>
              </Text>
            ))}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  loader: {
    marginVertical: 24,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  center: {
    textAlign: 'center',
  },
  responseText: {
    fontWeight: '300',
  },
});
