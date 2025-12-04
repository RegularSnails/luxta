import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { WebView } from "react-native-webview";
import { useAuth } from "../contexts/AuthContext";

/**
 * Native (iOS/Android) interactive map screen using OpenStreetMap:
 * - loads the OSM map in an in-app WebView
 * - fully interactive: pan, zoom, change layers, etc.
 * - no API keys required
 *
 * On web, this screen is overridden by `MapScreen.web.js` which uses
 * `react-leaflet` for a native-feeling browser map.
 */

const LAT = 34.05636;
const LON = -117.82408;
const ZOOM = 12;
const OSM_URL = `https://www.openstreetmap.org/#map=${ZOOM}/${LAT}/${LON}`;

export default function MapScreen({ navigation }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.lockedContainer]}>
        <Text style={styles.lockedTitle}>Login required</Text>
        <Text style={styles.lockedText}>You need to sign in to access the map.</Text>
        <Button title="Go to Login" onPress={() => navigation.replace("Login")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luxta Map</Text>
      <View style={styles.mapWrapper}>
        <WebView
          source={{ uri: OSM_URL }}
          style={styles.map}
          // Helps OSM behave more like a full-page app inside the WebView
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
        />
      </View>
      <Text style={styles.caption}>
        This is the live OpenStreetMap view. Pan and zoom to explore locations.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    paddingTop: 8,
    paddingBottom: 4,
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  caption: {
    fontSize: 12,
    opacity: 0.8,
    color: "#fff",
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  lockedContainer: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
  },
  lockedTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  lockedText: { color: "#ddd", fontSize: 14, marginBottom: 12, textAlign: "center" },
});
