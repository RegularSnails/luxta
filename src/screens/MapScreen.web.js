import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapContainer, TileLayer, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const INITIAL_LAT = 34.05636;
const INITIAL_LON = -117.82408;
const INITIAL_ZOOM = 12;

const TIME_ZONES = [
  { id: "local", label: "Browser local time" },
  { id: "UTC", label: "UTC" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles" },
  { id: "America/New_York", label: "America/New_York" },
  { id: "Europe/London", label: "Europe/London" },
  { id: "Asia/Tokyo", label: "Asia/Tokyo" },
];

// Compute an endpoint for a ray from (lat, lon) at given azimuth.
// Distance is small so a simple great-circle forward calculation is fine.
function computeRayEndpoint(lat, lon, azimuthDeg, distanceKm = 10) {
  if (azimuthDeg == null) return [lat, lon];
  const R = 6371; // km
  const dR = distanceKm / R;
  const brng = (azimuthDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinDR = Math.sin(dR);
  const cosDR = Math.cos(dR);

  const lat2 = Math.asin(
    sinLat1 * cosDR + cosLat1 * sinDR * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * sinDR * cosLat1,
      cosDR - sinLat1 * Math.sin(lat2)
    );

  return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
}

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
  const [ephemerisSummary, setEphemerisSummary] = useState(null);
  const [timeZone, setTimeZone] = useState("local");

  async function handlePointChange({ lat, lon, lng }) {
    const lonVal = lon ?? lng;
    setCoords({ lat, lon: lonVal });

    // Call our Spring Boot backend, which proxies to Radiant Drift.
    const iso = new Date().toISOString();
    try {
      // For local dev, target the Spring Boot server directly.
      // Adjust host/port as needed for your setup.
      const resp = await fetch(
        `http://localhost:8080/api/ephemeris?lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lonVal)}&date=${encodeURIComponent(iso)}`
      );

      const text = await resp.text();
      try {
        const json = JSON.parse(text);
        console.log("Ephemeris data:", json);

        // Radiant Drift /rise-transit-set response:
        // {
        //   query: {...},
        //   response: {
        //     "2018-03-01T07:00:00.000Z": [
        //       { key: "sunrise", ... },
        //       { key: "solar_transit", ... },
        //       { key: "sunset", ... },
        //       { key: "moonrise", ... },
        //       { key: "moonset", ... }
        //     ]
        //   }
        // }
        const dayKey = iso;
        const dayEntries =
          json?.response?.[dayKey] ??
          (json?.response
            ? json.response[Object.keys(json.response)[0]]
            : null);

        if (!Array.isArray(dayEntries)) {
          setEphemerisSummary(null);
          return;
        }

        const byKey = Object.fromEntries(dayEntries.map((e) => [e.key, e]));

        const sunrise = byKey.sunrise;
        const sunset = byKey.sunset;
        const moonrise = byKey.moonrise;
        const moonset = byKey.moonset;

        setEphemerisSummary({
          sunrise,
          sunset,
          moonrise,
          moonset,
        });
      } catch (parseErr) {
        console.error("Failed to parse ephemeris JSON:", parseErr, "raw:", text);
        setEphemerisSummary(null);
      }
    } catch (e) {
      console.error("Failed to load ephemeris", e);
      setEphemerisSummary(null);
    }
  }

  function formatTime(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (timeZone === "local") {
      return d.toLocaleTimeString();
    }
    try {
      return d.toLocaleTimeString(undefined, { timeZone });
    } catch {
      // Fallback if browser doesn't know the zone
      return d.toLocaleTimeString();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luxta Map (Web)</Text>
      <View style={styles.controlsRow}>
        <Text style={styles.controlsLabel}>Time zone:</Text>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          style={styles.selectNative}
        >
          {TIME_ZONES.map((tz) => (
            <option key={tz.id} value={tz.id}>
              {tz.label}
            </option>
          ))}
        </select>
      </View>
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
          <ClickHandler onChange={handlePointChange} />

          {ephemerisSummary && (
            <>
              {/* Sunrise / Sunset rays */}
              {ephemerisSummary.sunrise?.azAlt?.apparent?.azimuth != null && (
                <Polyline
                  positions={[
                    [coords.lat, coords.lon],
                    computeRayEndpoint(
                      coords.lat,
                      coords.lon,
                      ephemerisSummary.sunrise.azAlt.apparent.azimuth
                    ),
                  ]}
                  pathOptions={{ color: "#ffb300", weight: 3 }}
                />
              )}
              {ephemerisSummary.sunset?.azAlt?.apparent?.azimuth != null && (
                <Polyline
                  positions={[
                    [coords.lat, coords.lon],
                    computeRayEndpoint(
                      coords.lat,
                      coords.lon,
                      ephemerisSummary.sunset.azAlt.apparent.azimuth
                    ),
                  ]}
                  pathOptions={{ color: "#f57c00", weight: 3, dashArray: "6 4" }}
                />
              )}

              {/* Moonrise / Moonset rays */}
              {ephemerisSummary.moonrise?.azAlt?.apparent?.azimuth != null && (
                <Polyline
                  positions={[
                    [coords.lat, coords.lon],
                    computeRayEndpoint(
                      coords.lat,
                      coords.lon,
                      ephemerisSummary.moonrise.azAlt.apparent.azimuth
                    ),
                  ]}
                  pathOptions={{ color: "#29b6f6", weight: 2 }}
                />
              )}
              {ephemerisSummary.moonset?.azAlt?.apparent?.azimuth != null && (
                <Polyline
                  positions={[
                    [coords.lat, coords.lon],
                    computeRayEndpoint(
                      coords.lat,
                      coords.lon,
                      ephemerisSummary.moonset.azAlt.apparent.azimuth
                    ),
                  ]}
                  pathOptions={{ color: "#0288d1", weight: 2, dashArray: "6 4" }}
                />
              )}
            </>
          )}
        </MapContainer>
      </View>
      <Text style={styles.caption}>
        Click anywhere on the map to update the point. Current selection:{" "}
        {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
      </Text>
      {ephemerisSummary && (
        <View>
          <Text style={styles.caption}>
            Sun: rise {formatTime(ephemerisSummary.sunrise.date)} · set{" "}
            {formatTime(ephemerisSummary.sunset.date)}
          </Text>
          <Text style={styles.caption}>
            Moon: rise {formatTime(ephemerisSummary.moonrise.date)} · set{" "}
            {formatTime(ephemerisSummary.moonset.date)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 8,
  },
  controlsLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  // Native HTML select styling for web-only file
  selectNative: {
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  caption: { fontSize: 12, opacity: 0.7, textAlign: "center", maxWidth: 420 },
});

