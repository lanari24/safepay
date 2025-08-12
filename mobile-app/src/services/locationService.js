import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.isWatching = false;
  }

  /**
   * Request location permissions
   */
  async requestPermissions() {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Rwanda Safe Pay needs location access to provide emergency services and find nearby security agents.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.openAppSettingsAsync() }
          ]
        );
        return false;
      }

      // For emergency features, also request background location
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted'
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(options = {}) {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.foreground) {
        throw new Error('Location permission not granted');
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      };

      const location = await Location.getCurrentPositionAsync({
        ...defaultOptions,
        ...options
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      throw this.handleLocationError(error);
    }
  }

  /**
   * Start watching location changes
   */
  async startWatching(callback, options = {}) {
    try {
      const permissions = await this.requestPermissions();
      if (!permissions.foreground) {
        throw new Error('Location permission not granted');
      }

      if (this.isWatching) {
        this.stopWatching();
      }

      const defaultOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      };

      this.watchId = await Location.watchPositionAsync(
        { ...defaultOptions, ...options },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp
          };
          
          if (callback) {
            callback(this.currentLocation);
          }
        }
      );

      this.isWatching = true;
      return this.watchId;
    } catch (error) {
      console.error('Error starting location watch:', error);
      throw this.handleLocationError(error);
    }
  }

  /**
   * Stop watching location changes
   */
  stopWatching() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.isWatching = false;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street,
          district: address.district || address.subregion,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: this.formatAddress(address)
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }

  /**
   * Get coordinates from address (geocoding)
   */
  async getCoordinatesFromAddress(address) {
    try {
      const locations = await Location.geocodeAsync(address);
      
      if (locations && locations.length > 0) {
        return {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check if location is within Rwanda bounds
   */
  isLocationInRwanda(latitude, longitude) {
    // Rwanda approximate bounds
    const rwandaBounds = {
      north: -1.0,
      south: -2.9,
      east: 30.9,
      west: 28.8
    };

    return (
      latitude >= rwandaBounds.south &&
      latitude <= rwandaBounds.north &&
      longitude >= rwandaBounds.west &&
      longitude <= rwandaBounds.east
    );
  }

  /**
   * Get location for emergency (high accuracy, quick)
   */
  async getEmergencyLocation() {
    try {
      const location = await this.getCurrentLocation({
        accuracy: Location.Accuracy.BestForNavigation,
        timeout: 10000,
        maximumAge: 5000
      });

      // Validate location is in Rwanda
      if (!this.isLocationInRwanda(location.latitude, location.longitude)) {
        Alert.alert(
          'Location Warning',
          'Your location appears to be outside Rwanda. Emergency services may not be available.',
          [{ text: 'OK' }]
        );
      }

      return location;
    } catch (error) {
      console.error('Error getting emergency location:', error);
      throw error;
    }
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region && address.region !== address.city) parts.push(address.region);
    
    return parts.join(', ') || 'Unknown location';
  }

  /**
   * Handle location errors
   */
  handleLocationError(error) {
    let message = 'Unable to get your location';
    
    if (error.code) {
      switch (error.code) {
        case 'E_LOCATION_SERVICES_DISABLED':
          message = 'Location services are disabled. Please enable them in your device settings.';
          break;
        case 'E_LOCATION_TIMEOUT':
          message = 'Location request timed out. Please try again.';
          break;
        case 'E_LOCATION_UNAVAILABLE':
          message = 'Location is temporarily unavailable. Please try again.';
          break;
        case 'E_LOCATION_UNAUTHORIZED':
          message = 'Location permission denied. Please grant location access in app settings.';
          break;
        default:
          message = error.message || 'An error occurred while getting your location';
      }
    }

    return {
      code: error.code || 'LOCATION_ERROR',
      message
    };
  }

  /**
   * Get cached location
   */
  getCachedLocation() {
    return this.currentLocation;
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled() {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Open device location settings
   */
  async openLocationSettings() {
    try {
      await Location.openAppSettingsAsync();
    } catch (error) {
      console.error('Error opening location settings:', error);
    }
  }
}

export default new LocationService();
