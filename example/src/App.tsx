import * as React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Web3Modal } from '@web3modal/react-native';

export default function App() {
  const [visible, setVisible] = React.useState<boolean>(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setVisible(true)}>
        <Text>Press</Text>
      </Pressable>
      <Web3Modal
        isVisible={visible}
        onClose={() => setVisible(false)}
        projectId=""
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
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
