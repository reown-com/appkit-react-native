"use client";

import { Button, Text } from "@web3modal/ui-react-native";

import styles from "../styles/index.module.css";

export default function Web() {
  return (
    <div className={styles.container}>
      <Text>Web</Text>
      <Button onClick={() => console.log("Pressed!")} text="Boop" />
    </div>
  );
}
