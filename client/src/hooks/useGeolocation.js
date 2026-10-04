import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation Hook
 * Detects the device's real-time GPS coordinates using the browser's native Geolocation API.
 * 
 * WHY maximumAge: 0 IS CRITICAL:
 * By default, mobile and desktop browsers cache geolocation fixes for several minutes to save battery.
 * In a road accident or trauma scenario, a bystander or ambulance driver has just arrived at a new,
 * urgent physical location. Using `maximumAge: 0` forces the device hardware to bypass any stale cache
 * and acquire a fresh, immediate satellite/cellular position fix.
 */
export default function useGeolocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (err) => {
        let message = 'Location access denied. Please allow location permissions in your browser address bar, or choose a city below.';
        if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please retry or choose a city preset below.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable on this device.';
        }

        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: message,
          loading: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Always fetch fresh, non-cached coordinates
      }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { ...location, detectLocation };
}
