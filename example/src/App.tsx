import React from 'react';

import { StyleSheet, View } from 'react-native';
import { Web3Modal, Web3Button } from '@web3modal/react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Web3Button />
      <Web3Modal
        projectId="YOUR_PROJECT_ID"
        relayUrl="wss://relay.walletconnect.com"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
