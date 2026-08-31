/**
 * Zero-Lag High-Frequency Location Provider
 * Streams continuous GPS coordinates, speed, heading, and battery metadata in real time.
 */

import { getBatteryStatus } from "@/lib/battery";

export interface LocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  speed_kmh?: number | null;
  heading?: number | null;
  battery_level?: number | null;
  is_charging?: boolean | null;
}

export interface LocationProviderOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  minDistanceMeters?: number;
  minIntervalMs?: number;
}

export interface ILocationProvider {
  getCurrentLocation(): Promise<LocationReading>;
  startTracking(
    onLocation: (reading: LocationReading) => void,
    onError: (error: Error) => void
  ): () => void;
}

export class BrowserLocationProvider implements ILocationProvider {
  private options: LocationProviderOptions;
  private lastReading: LocationReading | null = null;
  private lastEmitTime: number = 0;

  constructor(options: LocationProviderOptions = {}) {
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000, // Fresh coordinates within 3 seconds
      minDistanceMeters: 5,
      minIntervalMs: 2500, // Fast 2.5s streaming for zero-lag updates
      ...options,
    };
  }

  public async getCurrentLocation(): Promise<LocationReading> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    const battery = await getBatteryStatus();

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const rawSpeed = pos.coords.speed;
          const speedKmh = rawSpeed !== null && rawSpeed !== undefined && rawSpeed >= 0
            ? Math.round(rawSpeed * 3.6)
            : null;

          const reading: LocationReading = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp || Date.now(),
            speed: rawSpeed,
            speed_kmh: speedKmh,
            heading: pos.coords.heading,
            battery_level: battery?.level ?? null,
            is_charging: battery?.charging ?? null,
          };
          this.lastReading = reading;
          resolve(reading);
        },
        (err) => {
          reject(new Error(err.message || "Failed to acquire GPS fix."));
        },
        {
          enableHighAccuracy: this.options.enableHighAccuracy,
          timeout: this.options.timeout,
          maximumAge: this.options.maximumAge,
        }
      );
    });
  }

  public startTracking(
    onLocation: (reading: LocationReading) => void,
    onError: (error: Error) => void
  ): () => void {
    if (typeof window === "undefined" || !navigator.geolocation) {
      onError(new Error("Geolocation is not supported in this browser."));
      return () => {};
    }

    // Immediately trigger initial reading
    this.getCurrentLocation()
      .then((initialReading) => {
        this.lastReading = initialReading;
        this.lastEmitTime = Date.now();
        onLocation(initialReading);
      })
      .catch(() => {});

    // Continuous watchPosition for zero lag
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        const rawSpeed = pos.coords.speed;
        const speedKmh = rawSpeed !== null && rawSpeed !== undefined && rawSpeed >= 0
          ? Math.round(rawSpeed * 3.6)
          : null;

        const battery = await getBatteryStatus();

        const reading: LocationReading = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || now,
          speed: rawSpeed,
          speed_kmh: speedKmh,
          heading: pos.coords.heading,
          battery_level: battery?.level ?? null,
          is_charging: battery?.charging ?? null,
        };

        // Filter out extreme GPS errors (accuracy > 500m or 0,0 coords)
        if (reading.accuracy > 500 || (reading.latitude === 0 && reading.longitude === 0)) {
          return;
        }

        // Throttle updates slightly to avoid network clogging while maintaining responsive 2.5s cadence
        if (
          this.options.minIntervalMs &&
          now - this.lastEmitTime < this.options.minIntervalMs
        ) {
          return;
        }

        this.lastReading = reading;
        this.lastEmitTime = now;
        onLocation(reading);
      },
      (err) => {
        onError(new Error(err.message || "Location watch error."));
      },
      {
        enableHighAccuracy: this.options.enableHighAccuracy,
        timeout: this.options.timeout,
        maximumAge: this.options.maximumAge,
      }
    );

    return () => {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }
}
