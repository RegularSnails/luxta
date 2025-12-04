import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import './App.css';
import { useAuth } from "../contexts/AuthContext";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Polyline,
  useMap,
  Marker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
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

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeLongitude(lon) {
  // Wrap longitude into [-180, 180)
  const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180;
  return wrapped;
}

function azimuthToCardinal(azimuthDeg) {
  if (azimuthDeg == null || Number.isNaN(azimuthDeg)) return "?";
  // Normalize into [0, 360)
  const a = ((azimuthDeg % 360) + 360) % 360;
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const idx = Math.round(a / 22.5) % 16;
  return directions[idx];
}

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      const domTarget = e.originalEvent?.target;
      if (
        domTarget &&
        typeof domTarget.closest === "function" &&
        (domTarget.closest(".ray-interactive") ||
          domTarget.closest(".ray-tooltip"))
      ) {
        // Ignore clicks that originated on rays or their tooltips.
        return;
      }
      const { lat, lng } = e.latlng;
      onChange?.({ lat, lng });
    },
  });
  return null;
}

const EVENT_STYLES = {
  sunrise: {
    label: "Sunrise",
    color: "#ffb300",
    dashArray: null,
    weight: 6,
  },
  sunset: {
    label: "Sunset",
    color: "#f57c00",
    dashArray: "15 13",
    weight: 5,
  },
  moonrise: {
    label: "Moonrise",
    color: "#29b6f6",
    dashArray: null,
    weight: 6,
  },
  moonset: {
    label: "Moonset",
    color: "#0288d1",
    dashArray: "15 13",
    weight: 5,
  },
};

function RayOverlay({ coords, ephemerisSummary }) {
  const map = useMap();
  const [hoverKey, setHoverKey] = useState(null);
  const [selectedRay, setSelectedRay] = useState(null);
  if (!map || !ephemerisSummary) return null;

  // Clear any selected tooltip when the projection point moves.
  useEffect(() => {
    setSelectedRay(null);
  }, [coords.lat, coords.lon]);

  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const diagonalKm = haversineDistance(ne.lat, ne.lng, sw.lat, sw.lng);
  const rayDistance = Math.max(diagonalKm, 5); // ensure we extend past current view

  const rays = [
    { key: "sunrise", entry: ephemerisSummary.sunrise },
    { key: "sunset", entry: ephemerisSummary.sunset },
    { key: "moonrise", entry: ephemerisSummary.moonrise },
    { key: "moonset", entry: ephemerisSummary.moonset },
  ];

  return (
    <>
      {rays.map(({ key, entry }) => {
        const style = EVENT_STYLES[key];
        const azimuth = entry?.azAlt?.apparent?.azimuth;
        if (!style || azimuth == null) return null;
        const { label, color, dashArray, weight } = style;
        const isHovered = hoverKey === key;
        const isSelected = selectedRay?.key === key;
        const combinedOptions = {
          color,
          dashArray: dashArray ?? undefined,
          weight: weight + (isHovered ? 2 : 0) + (isSelected ? 1 : 0),
          opacity: isHovered || isSelected ? 1 : 0.85,
          className:
            "ray-interactive",
        };
        return (
          <Polyline
            key={key}
            positions={[
              [coords.lat, coords.lon],
              computeRayEndpoint(coords.lat, coords.lon, azimuth, rayDistance),
            ]}
            pathOptions={combinedOptions}
            bubblingMouseEvents={false}
            eventHandlers={{
              mouseover: () => setHoverKey(key),
              mouseout: () =>
                setHoverKey((prev) => (prev === key ? null : prev)),
              click: (e) => {
                // Prevent map click from firing when selecting a ray.
                e.originalEvent?.stopPropagation?.();
                e.originalEvent?.preventDefault?.();
                const clickLatLng = e.latlng;
                setSelectedRay((prev) =>
                  prev && prev.key === key
                    ? null
                    : {
                        key,
                        label,
                        azimuth,
                        position: clickLatLng,
                      }
                );
              },
            }}
          >
          </Polyline>
        );
      })}
      {selectedRay && selectedRay.position && (
        <Marker
          position={[
            selectedRay.position.lat,
            selectedRay.position.lng,
          ]}
          opacity={0}
          interactive={false}
        >
          <Tooltip permanent direction="top" className="ray-tooltip">
            <span>
              {selectedRay.label}: {selectedRay.azimuth.toFixed(1)}&deg; (
              {azimuthToCardinal(selectedRay.azimuth)})
            </span>
          </Tooltip>
        </Marker>
      )}
    </>
  );
}

const projectionIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(30, 136, 229, 0.2);
      border: 2px solid #1e88e5;
      box-shadow: 0 0 6px rgba(30, 136, 229, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #1e88e5;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ProjectionMarker({ coords, onChange }) {
  const [position, setPosition] = useState([coords.lat, coords.lon]);

  useEffect(() => {
    setPosition([coords.lat, coords.lon]);
  }, [coords.lat, coords.lon]);

  const eventHandlers = useMemo(
    () => ({
      drag(e) {
        const { lat, lng } = e.target.getLatLng();
        setPosition([lat, lng]);
      },
      dragend(e) {
        const { lat, lng } = e.target.getLatLng();
        const next = { lat, lon: lng, lng };
        setPosition([lat, lng]);
        onChange?.(next);
      },
    }),
    [onChange]
  );

  return (
    <Marker
      draggable
      position={position}
      icon={projectionIcon}
      eventHandlers={eventHandlers}
    />
  );
}

export default function MapScreen() {
  const navigation = useNavigation();
  const { currentUser, logout } = useAuth();
  const [coords, setCoords] = useState({ lat: INITIAL_LAT, lon: INITIAL_LON });
  const [ephemerisSummary, setEphemerisSummary] = useState(null);
  const [timeZone, setTimeZone] = useState("local");
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [isCircularDropdownOpen, setIsCircularDropdownOpen] = useState(false);
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsCircularDropdownOpen(false);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  async function handlePointChange({ lat, lon, lng }, dateOverride) {
    const rawLon = lon ?? lng;
    const lonVal = normalizeLongitude(rawLon);
    setCoords({ lat, lon: lonVal });

    // Call our Spring Boot backend, which proxies to Radiant Drift.
    // Use the selected calendar date at midnight UTC.
    const targetDate = dateOverride ?? selectedDate;
    const iso = new Date(`${targetDate}T00:00:00.000Z`).toISOString();
    try {
      // For local dev, target the Spring Boot server directly.
      // Adjust host/port as needed for your setup.
      // API requests don't require authentication
      const url = `http://localhost:8080/api/ephemeris?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lonVal)}&date=${encodeURIComponent(iso)}`;
      
      const resp = await fetch(url);

      console.log("Response status:", resp.status, resp.statusText);
      const text = await resp.text();
      try {
        const json = JSON.parse(text);
        console.log("Ephemeris data:", json);

        // Check for error response
        if (json?.error) {
          console.error("Ephemeris API error:", json.error);
          setEphemerisSummary(null);
          return;
        }

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
        sunrise: sunrise ?? null,
        sunset: sunset ?? null,
        moonrise: moonrise ?? null,
        moonset: moonset ?? null,
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
      <nav className="navbar">
        <div className="navbar-left">
          <span className="logo-text">Luxta</span>
        </div>
        <div className="navbar-right">
          {/* Dropdown Button (left of Login) */}
          <div className="dropdown-container">
            <button
              className="nav-dropdown-btn"
              onClick={() => setIsLeftDropdownOpen(!isLeftDropdownOpen)}
              aria-label="Menu dropdown"
            >
              ☰
            </button>
            {isLeftDropdownOpen && (
              <div className="dropdown-menu">
                <a href="#option1" className="dropdown-item">Saved Locations</a>
                <a href="#option2" className="dropdown-item">Location 1</a>
                <a href="#option3" className="dropdown-item">Location 2</a>
              </div>
            )}
          </div>

          {/* Login/Create Account Button or User Indicator */}
          {currentUser ? (
            <div className="user-indicator">
              <span className="user-email">{currentUser.email}</span>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={() => navigation.navigate("Login")}
            >
              Login/Create Account
            </button>
          )}

          {/* Circular Dropdown Button (rightmost) */}
          <div className="dropdown-container">
            <button
              className="circular-btn"
              onClick={() => setIsCircularDropdownOpen(!isCircularDropdownOpen)}
              aria-label="User menu"
            >
              ●
            </button>
            {isCircularDropdownOpen && (
              <div className="dropdown-menu">
                {currentUser && (
                  <>
                    <div className="dropdown-item" style={{ cursor: 'default', color: '#666' }}>
                      {currentUser.email}
                    </div>
                    <div className="dropdown-divider"></div>
                  </>
                )}
                <a href="#profile" className="dropdown-item">Profile</a>
                <a href="#settings" className="dropdown-item">Settings</a>
                {currentUser ? (
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                ) : (
                  <a 
                    href="#login" 
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      navigation.navigate("Login");
                    }}
                  >
                    Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <Text style={styles.title}></Text>
      <View style={styles.controlsRow}>
        <Text style={styles.controlsLabel}>Date:</Text>
        <button
          type="button"
          style={styles.dateShiftButton}
          onClick={() => {
            const current = new Date(`${selectedDate}T00:00:00.000Z`);
            current.setUTCDate(current.getUTCDate() - 1);
            const next = current.toISOString().slice(0, 10);
            setSelectedDate(next);
            handlePointChange({ lat: coords.lat, lon: coords.lon }, next);
          }}
        >
          −1d
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            const next = e.target.value;
            setSelectedDate(next);
            if (next) {
              // Re-fetch ephemeris for the new date at current location.
              handlePointChange({ lat: coords.lat, lon: coords.lon }, next);
            }
          }}
          style={styles.inputDate}
        />
        <button
          type="button"
          style={styles.dateShiftButton}
          onClick={() => {
            const current = new Date(`${selectedDate}T00:00:00.000Z`);
            current.setUTCDate(current.getUTCDate() + 1);
            const next = current.toISOString().slice(0, 10);
            setSelectedDate(next);
            handlePointChange({ lat: coords.lat, lon: coords.lon }, next);
          }}
        >
          +1d
        </button>
      </View>
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
        {ephemerisSummary && (
          <View style={styles.colorDialog}>
            <View style={styles.colorDialogSection}>
              <Text style={styles.colorDialogSectionTitle}>Sun</Text>
              <View style={styles.colorDialogRow}>
                <View style={styles.colorDialogItem}>
                  <View
                    style={[
                      styles.colorDialogSwatch,
                      { backgroundColor: EVENT_STYLES.sunrise.color },
                    ]}
                  />
                  <Text style={styles.colorDialogLabel}>Sunrise</Text>
                </View>
                <View style={styles.colorDialogItem}>
                  <View
                    style={[
                      styles.colorDialogSwatch,
                      {
                        backgroundColor: EVENT_STYLES.sunset.color,
                        borderStyle: "dashed",
                      },
                    ]}
                  />
                  <Text style={styles.colorDialogLabel}>Sunset</Text>
                </View>
              </View>
            </View>
            <View style={[styles.colorDialogSection, styles.colorDialogSectionLast]}>
              <Text style={styles.colorDialogSectionTitle}>Moon</Text>
              <View style={styles.colorDialogRow}>
                <View style={styles.colorDialogItem}>
                  <View
                    style={[
                      styles.colorDialogSwatch,
                      { backgroundColor: EVENT_STYLES.moonrise.color },
                    ]}
                  />
                  <Text style={styles.colorDialogLabel}>Moonrise</Text>
                </View>
                <View style={styles.colorDialogItem}>
                  <View
                    style={[
                      styles.colorDialogSwatch,
                      {
                        backgroundColor: EVENT_STYLES.moonset.color,
                        borderStyle: "dashed",
                      },
                    ]}
                  />
                  <Text style={styles.colorDialogLabel}>Moonset</Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
          {ephemerisSummary && (
            <View style={styles.legendContainer}>
              {["sunrise", "sunset", "moonrise", "moonset"].map((key) => {
                const style = EVENT_STYLES[key];
                if (!style) return null;
                return (
                  <View key={key} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendSwatch,
                        {
                          backgroundColor: style.color,
                          borderStyle: style.dashArray ? "dashed" : "solid",
                        },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{style.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
          <ClickHandler onChange={handlePointChange} />

          <ProjectionMarker coords={coords} onChange={handlePointChange} />

          {ephemerisSummary && (
            <RayOverlay coords={coords} ephemerisSummary={ephemerisSummary} />
          )}
        </MapContainer>
      </View>
      <Text style={styles.caption}>
        Click anywhere or drag the marker to update the projection position. Current selection:{" "}
        {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
      </Text>
      {ephemerisSummary && (
        <View style={styles.eventCardsContainer}>
          {[
            { key: "sunrise", title: "Sunrise", entry: ephemerisSummary.sunrise },
            { key: "sunset", title: "Sunset", entry: ephemerisSummary.sunset },
            { key: "moonrise", title: "Moonrise", entry: ephemerisSummary.moonrise },
            { key: "moonset", title: "Moonset", entry: ephemerisSummary.moonset },
          ].map(({ key, title, entry }) => {
            if (!entry) return null;
            const style = EVENT_STYLES[key];
            const azimuth = entry.azAlt?.apparent?.azimuth;
            const azText =
              azimuth != null && !Number.isNaN(azimuth)
                ? `${azimuth.toFixed(1)}° (${azimuthToCardinal(azimuth)})`
                : "-";
            const timeText = entry.date ? formatTime(entry.date) : "-";
            return (
              <View
                key={key}
                style={[
                  styles.eventCard,
                  style && { borderColor: style.color },
                ]}
              >
                <Text style={styles.eventCardTitle}>{title}</Text>
                <Text style={styles.eventCardRow}>
                  Time: <Text style={styles.eventCardValue}>{timeText}</Text>
                </Text>
                <Text style={styles.eventCardRow}>
                  Direction:{" "}
                  <Text style={styles.eventCardValue}>{azText}</Text>
                </Text>
              </View>
            );
          })}
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
  inputDate: {
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
    minWidth: 130,
  },
  dateShiftButton: {
    fontSize: 12,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#888",
    backgroundColor: "#f6f6f6",
    cursor: "pointer",
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  colorDialog: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1000,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.15)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    minWidth: 200,
  },
  colorDialogSection: {
    marginBottom: 8,
  },
  colorDialogSectionLast: {
    marginBottom: 0,
  },
  colorDialogSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    opacity: 0.9,
  },
  colorDialogRow: {
    flexDirection: "row",
    gap: 12,
  },
  colorDialogItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  colorDialogSwatch: {
    width: 20,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  colorDialogLabel: {
    fontSize: 11,
    opacity: 0.85,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  legendContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    flexDirection: "column",
    gap: 4,
    pointerEvents: "none",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 18,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  legendLabel: {
    fontSize: 11,
    opacity: 0.85,
  },
  caption: { fontSize: 12, opacity: 0.7, textAlign: "center", maxWidth: 420 },
  eventCardsContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  eventCard: {
    minWidth: 150,
    maxWidth: 200,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  eventCardTitle: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 13,
  },
  eventCardRow: {
    fontSize: 12,
    opacity: 0.85,
  },
  eventCardValue: {
    fontWeight: "500",
    opacity: 1,
  },
});

