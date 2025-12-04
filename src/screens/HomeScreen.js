import React from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  const handleOpenMap = () => {
    if (!currentUser) {
      Alert.alert("Login required", "Please log in to open the map.");
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("Map");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LUXTA</Text>
      <Text style={styles.subtitle}>Weather-related photography assistance</Text>
      {currentUser ? (
        <Text style={styles.welcome}>Signed in as {currentUser.email}</Text>
      ) : (
        <Text style={styles.welcome}>You are not signed in.</Text>
      )}
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}>
          <Button title="Open Map" onPress={handleOpenMap} />
        </View>
        {currentUser ? (
          <View style={styles.buttonWrapper}>
            <Button title="Logout" onPress={logout} />
          </View>
        ) : (
          <>
            <View style={styles.buttonWrapper}>
              <Button title="Login" onPress={() => navigation.navigate("Login")} />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Sign Up" onPress={() => navigation.navigate("SignUp")} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  logo: { fontSize: 64, fontWeight: "900", letterSpacing: 6, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#444", marginBottom: 24 },
  welcome: { fontSize: 14, color: "#444", marginBottom: 16 },
  buttonGroup: { width: "100%", maxWidth: 320, alignItems: "stretch" },
  buttonWrapper: { marginBottom: 12 }
});
