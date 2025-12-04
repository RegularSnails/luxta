import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LUXTA</Text>
      <Text style={styles.subtitle}>Weather-related photography assistance</Text>

      <View style={styles.buttonGroup}>
        //weather and sunincludsion trasntion to those screens!
        <View style={styles.buttonWrapper}>
          <Button
            title="Plan My Shoot"
            onPress={() => navigation.navigate("PlanShoot")}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Open Map"
            onPress={() => navigation.navigate("Map")}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Login"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { fontSize: 64, fontWeight: "900", letterSpacing: 6, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#444", marginBottom: 24 },
  buttonGroup: { width: "100%", maxWidth: 320, alignItems: "stretch" },
  buttonWrapper: { marginBottom: 12 }
});
