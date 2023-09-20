import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Web3Modal } from '@web3modal/scaffold-react-native';

export default function Native() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Web3Modal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginBottom: 20
  }
});
