import React from "react";
import { View, Text, StyleSheet } from "react-native";
import data from "../data/luca.json";

export default function LucaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.line}>Luca's first API should be working.</Text>
      <Text style={styles.line}>ok: {String(data.ok)}</Text>
      <Text style={styles.line}>owner: {data.owner}</Text>
      <Text style={styles.line}>team: {data.team}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  line: { fontSize: 16, marginVertical: 4 }
});
