import React from "react";
import { View, Text, Image, Linking, Pressable, StyleSheet } from "react-native";

/**
 * Simple, zero-config "map" screen:
 * - shows a static OpenStreetMap tile around SF (change lat/lon as you like)
 * - tap "Open full map" to open interactive OSM in the browser
 * Works on iOS, Android, and Web without API keys.
 */

const LAT = 37.7749;
const LON = -122.4194;
const ZOOM = 12;
// OpenStreetMap static tile (one tile example). For a nicer image, you can swap in a static map service if desired.
const TILE_URL = `https://tile.openstreetmap.org/${ZOOM}/${Math.floor((LON+180)/360*Math.pow(2,ZOOM))}/${Math.floor((1 - Math.log(Math.tan(LAT*Math.PI/180) + 1/Math.cos(LAT*Math.PI/180))/Math.PI)/2*Math.pow(2,ZOOM))}.png`;
const OSM_URL = `https://www.openstreetmap.org/#map=${ZOOM}/${LAT}/${LON}`;

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luxta Map</Text>
      <Image
        source={{ uri: TILE_URL }}
        style={styles.mapImage}
        resizeMode="cover"
        accessibilityLabel="Map preview"
      />
      <Pressable onPress={() => Linking.openURL(OSM_URL)} style={styles.button}>
        <Text style={styles.buttonText}>Open full map</Text>
      </Pressable>
      <Text style={styles.caption}>
        Static preview. Click the button for the interactive map on OpenStreetMap.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "600" },
  mapImage: { width: 320, height: 200, borderRadius: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#111" },
  buttonText: { color: "#fff", fontSize: 16 },
  caption: { fontSize: 12, opacity: 0.7, textAlign: "center", maxWidth: 360 }
});
