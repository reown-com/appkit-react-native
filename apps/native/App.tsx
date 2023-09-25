import { StyleSheet, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Web3Modal, W3mButton } from '@web3modal/scaffold-react-native';

export default function Native() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDarkMode && styles.dark]}>
      <StatusBar style="auto" />
      <W3mButton label="Connect" loadingLabel="Connecting..." balance="show" />
      <Web3Modal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  dark: {
    backgroundColor: '#141414'
  },
  text: {
    marginBottom: 20
  }
});
