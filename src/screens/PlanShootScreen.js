import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import * as Location from "expo-location";

export default function PlanShootScreen() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [conditions, setConditions] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // when vm backload is here
  const API_BASE = "http://localhost:8080";

  const getLocationAndLoad = async () => {
    try {
      setErrorMsg(null);
      setConditions(null);
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access your location was denied.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });

      const url = `${API_BASE}/api/conditions?lat=${latitude}&lon=${longitude}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setConditions(json);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load te needed conditions");
      Alert.alert("Error", "Failed to load the needed conditions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
        Plan My Shoot
      </Text>

      <Button title="Use my current location" onPress={getLocationAndLoad} />

      {loading && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
          <Text>Loading conditions…</Text>
        </View>
      )}

      {errorMsg && (
        <Text style={{ color: "red", marginTop: 8 }}>{errorMsg}</Text>
      )}

      {location && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "600" }}>Location</Text>
          <Text>
            lat {location.latitude.toFixed(4)}, lon{" "}
            {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {conditions && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>Weather</Text>
          <Text>{conditions.weather?.name}</Text>
          <Text>{conditions.weather?.shortForecast}</Text>
          <Text>
            {conditions.weather?.temperature}{" "}
            {conditions.weather?.temperatureUnit}
          </Text>
          <Text>
            Wind: {conditions.weather?.windSpeed}{" "}
            {conditions.weather?.windDirection}
          </Text>
          <Text style={{ marginTop: 4 }}>
            {conditions.weather?.detailedForecast}
          </Text>

          <Text
            style={{ fontSize: 18, fontWeight: "600", marginTop: 16 }}
          >
            Sun & Golden Hour
          </Text>
          <Text>Sunrise: {conditions.sun?.sunrise}</Text>
          <Text>Transit: {conditions.sun?.transit}</Text>
          <Text>Sunset: {conditions.sun?.sunset}</Text>

          <Text style={{ marginTop: 8, fontWeight: "600" }}>Golden Hour</Text>
          <Text>
            Morning: {conditions.sun?.goldenHourMorningStart} →{" "}
            {conditions.sun?.goldenHourMorningEnd}
          </Text>
          <Text>
            Evening: {conditions.sun?.goldenHourEveningStart} →{" "}
            {conditions.sun?.goldenHourEveningEnd}
          </Text>
        </View>
      )}

      {conditions && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Luxta Tips
          </Text>
          <Text>
            • Morning golden hour: softer, warmer light – great for portraits.
          </Text>
          <Text>
            • Evening golden hour: stronger contrast – try silhouettes or
            backlit shots.
          </Text>
          <Text>
            • Check wind speed if you plan long exposures or tripod work.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
