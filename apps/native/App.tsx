import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button, Text } from "ui";

export default function Native() {
  return (
    <View style={styles.container}>
      <Text style={styles.text} variant="large-700">Native</Text>
      <Button
        onClick={() => {
          console.log("Pressed!");
          alert("Pressed!");
        }}
        text="Boop"
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginBottom: 20,
  },
});
