package com.regularsnails.server;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Thin proxy around the Radiant Drift ephemeris API.
 *
 * Frontend calls:
 *   GET /api/ephemeris?lat=..&lon=..&date=ISO_INSTANT
 *
 * This controller forwards the request to Radiant Drift's
 * /rise-transit-set/{start-date}/{end-date} endpoint and returns
 * the raw JSON response.
 */
@RestController
@CrossOrigin(origins = "*") // Dev-only: allow frontend on different port to call this API
@RequestMapping("/api")
public class EphemerisController {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Base URL for the Radiant Drift endpoint, e.g.
     * https://api.radiantdrift.com/rise-transit-set
     */
    @Value("${radiantdrift.base-url}")
    private String baseUrl;

    @Value("${radiantdrift.api-key}")
    private String apiKey;

    @GetMapping("/ephemeris")
    public ResponseEntity<String> getEphemeris(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam("date") String isoDateTime
    ) {
        // date is an ISO-8601 instant, e.g. 2018-03-01T07:00:00.000Z
        Instant start = Instant.parse(isoDateTime);
        Instant end = start.plus(1, ChronoUnit.DAYS);

        String startStr = start.toString();
        String endStr = end.toString();

        // Build observer string: "lat,lon,elevation"
        String observer = lat + "," + lon + ",0";

        String url = UriComponentsBuilder
                // baseUrl should be e.g. https://api.radiantdrift.com/rise-transit-set
                .fromHttpUrl(baseUrl + "/" + startStr + "/" + endStr)
                .queryParam("observer", observer)
                .queryParam("body", "sun,moon")
                .queryParam("hah", 0)
                .queryParam("apiKey", apiKey)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
        );

        return ResponseEntity
                .status(response.getStatusCode())
                .headers(response.getHeaders())
                .body(response.getBody());
    }
}

