import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

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

export default function MapScreen() {
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
});
