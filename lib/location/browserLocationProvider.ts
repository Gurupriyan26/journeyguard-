/**
 * Location Provider interface so the browser Geolocation API
 * can be cleanly substituted with a native mobile background tracking service later.
 */

export interface LocationReading {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
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
      timeout: 15000,
      maximumAge: 10000,
      minDistanceMeters: 10,
      minIntervalMs: 5000,
      ...options,
    };
  }

  public getCurrentLocation(): Promise<LocationReading> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const reading: LocationReading = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp || Date.now(),
            speed: pos.coords.speed,
            heading: pos.coords.heading,
          };
          this.lastReading = reading;
          resolve(reading);
        },
        (err) => {
          reject(new Error(err.message || "Failed to get current location."));
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
      onError(new Error("Geolocation is not supported in this environment."));
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        const reading: LocationReading = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || now,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        };

        // Filter out obviously erroneous readings (e.g. accuracy > 500m or 0,0)
        if (reading.accuracy > 500 || (reading.latitude === 0 && reading.longitude === 0)) {
          return;
        }

        // Throttle updates to avoid excessive battery drain and DB spam
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

    // Return cleanup function to unsubscribe
    return () => {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }
}
