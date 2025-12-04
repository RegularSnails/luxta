import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const INITIAL_LAT = 37.7749;
const INITIAL_LON = -122.4194;
const INITIAL_ZOOM = 12;

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange?.({ lat, lng });
    },
  });
  return null;
}

export default function MapScreen() {
  const [coords, setCoords] = useState({ lat: INITIAL_LAT, lon: INITIAL_LON });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luxta Map (Web)</Text>
      <View style={styles.mapWrapper}>
        <MapContainer
          center={[INITIAL_LAT, INITIAL_LON]}
          zoom={INITIAL_ZOOM}
          style={styles.map}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={({ lat, lon, lng }) => setCoords({ lat, lon: lon ?? lng })} />
        </MapContainer>
      </View>
      <Text style={styles.caption}>
        Click anywhere on the map to update the point. Current selection:{" "}
        {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "600" },
  mapWrapper: { width: "100%", maxWidth: 900, height: 480 },
  map: { width: "100%", height: "100%" },
  caption: { fontSize: 12, opacity: 0.7, textAlign: "center", maxWidth: 420 },
});

