package com.regularsnails.server;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // allow Expo frontend to call backend
public class PhotoConditionsController {

    private final RestTemplate restTemplate;

    // NWS requires a User-Agent header. Replace with your email/app info.
    private static final String NWS_USER_AGENT = "LuxtaApp (your-email@example.com)";

    public PhotoConditionsController(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(8))
                .setReadTimeout(Duration.ofSeconds(8))
                .build();
    }

    // GET: /api/conditions?lat=37.77&lon=-122.42
    @GetMapping("/conditions")
    public ResponseEntity<?> getConditions(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon
    ) {
        try {
            Map<String, Object> weather = fetchWeatherFromNws(lat, lon);
            Map<String, Object> sun = fakeSunTimesForNow(); // Replace with Radiant Drift later

            Map<String, Object> response = new HashMap<>();
            response.put("location", Map.of("lat", lat, "lon", lon));
            response.put("weather", weather);
            response.put("sun", sun);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("error", "Failed to fetch conditions", "details", e.getMessage())
            );
        }
    }

    // --- WEATHER FROM NATIONAL WEATHER SERVICE (USA ONLY) ---
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchWeatherFromNws(double lat, double lon) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", NWS_USER_AGENT);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Step 1: Get forecast URL for this geographic point
        String pointsUrl = "https://api.weather.gov/points/" + lat + "," + lon;

        ResponseEntity<Map> pointsResp =
                restTemplate.exchange(pointsUrl, HttpMethod.GET, entity, Map.class);

        Map<String, Object> body = pointsResp.getBody();
        if (body == null) throw new RuntimeException("No NWS points response");

        Map<String, Object> properties = (Map<String, Object>) body.get("properties");
        if (properties == null) throw new RuntimeException("No NWS properties");

        String forecastUrl = (String) properties.get("forecast");
        if (forecastUrl == null) throw new RuntimeException("No forecast URL from NWS");

        // Step 2: Fetch forecast for this location
        ResponseEntity<Map> forecastResp =
                restTemplate.exchange(forecastUrl, HttpMethod.GET, entity, Map.class);

        Map<String, Object> forecastBody = forecastResp.getBody();
        if (forecastBody == null) throw new RuntimeException("No NWS forecast response");

        Map<String, Object> forecastProps =
                (Map<String, Object>) forecastBody.get("properties");

        var periods = (java.util.List<Map<String, Object>>) forecastProps.get("periods");
        if (periods == null || periods.isEmpty())
            throw new RuntimeException("No forecast periods found");

        Map<String, Object> firstPeriod = periods.get(0);

        Map<String, Object> simplified = new HashMap<>();
        simplified.put("name", firstPeriod.get("name"));
        simplified.put("shortForecast", firstPeriod.get("shortForecast"));
        simplified.put("detailedForecast", firstPeriod.get("detailedForecast"));
        simplified.put("temperature", firstPeriod.get("temperature"));
        simplified.put("temperatureUnit", firstPeriod.get("temperatureUnit"));
        simplified.put("windSpeed", firstPeriod.get("windSpeed"));
        simplified.put("windDirection", firstPeriod.get("windDirection"));

        return simplified;
    }

    // --- TEMPORARY SUN TIMES need drift but testing present
    private Map<String, Object> fakeSunTimesForNow() {

        LocalDate today = LocalDate.now();
        ZoneId zone = ZoneId.systemDefault();

        ZonedDateTime sunrise = today.atTime(7, 0).atZone(zone);
        ZonedDateTime sunset = today.atTime(18, 0).atZone(zone);
        ZonedDateTime transit = today.atTime(12, 30).atZone(zone);

        Map<String, Object> sun = new HashMap<>();
        sun.put("sunrise", sunrise.toString());
        sun.put("transit", transit.toString());
        sun.put("sunset", sunset.toString());

        // crude golden hour: 1 hour after sunrise, 1 hour before sunset logic included
        sun.put("goldenHourMorningStart", sunrise.toString());
        sun.put("goldenHourMorningEnd", sunrise.plusHours(1).toString());
        sun.put("goldenHourEveningStart", sunset.minusHours(1).toString());
        sun.put("goldenHourEveningEnd", sunset.toString());

        return sun;
    }
}
