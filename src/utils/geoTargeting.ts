// src/utils/geoTargeting.ts
// Geo-Targeting System for Mead - Precise location-based content delivery
// Powers Brews (worldwide or specific countries/regions), Ads Up campaigns, and live location sharing
// Fully interconnected with BrewCreateScreen, AdsUpDashboardScreen, and HomeScreen

import * as Location from 'expo-location';
import logger from './logger';

export interface GeoTarget {
  type: 'worldwide' | 'countries' | 'regions';
  countries?: string[];           // e.g. ['Kenya', 'Uganda', 'Tanzania']
  regions?: string[];             // e.g. ['Nairobi', 'Mombasa', 'Kisumu']
  coordinates?: {
    latitude: number;
    longitude: number;
    radiusKm: number;             // For radius-based targeting
  };
}

export interface GeoTargetResult {
  isValid: boolean;
  target: GeoTarget;
  error?: string;
  estimatedReach?: number;        // Approximate number of users who will see the content
}

class GeoTargetingService {

  // Request user location permission and get current position
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission denied', null, 'GeoTargeting', 'Location');
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Location permission request failed', error, 'GeoTargeting', 'Location');
      return false;
    }
  }

  // Get current user location
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) return null;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      logger.info('Current location acquired', { latitude: location.coords.latitude, longitude: location.coords.longitude }, 'GeoTargeting', 'Location');
      return location;
    } catch (error) {
      logger.error('Failed to get current location', error, 'GeoTargeting', 'Location');
      return null;
    }
  }

  // Validate and normalize geo target for Brews or Ads Up
  validateTarget(target: GeoTarget): GeoTargetResult {
    if (target.type === 'worldwide') {
      return {
        isValid: true,
        target,
        estimatedReach: 10000000, // Global estimate
      };
    }

    if (target.type === 'countries' && target.countries && target.countries.length > 0) {
      return {
        isValid: true,
        target,
        estimatedReach: target.countries.length * 500000, // Rough estimate per country
      };
    }

    if (target.type === 'regions' && target.regions && target.regions.length > 0) {
      return {
        isValid: true,
        target,
        estimatedReach: target.regions.length * 50000,
      };
    }

    return {
      isValid: false,
      target,
      error: 'Invalid geo target. Must specify worldwide, countries, or regions.',
    };
  }

  // Check if user is in target area (for content visibility)
  async isUserInTarget(target: GeoTarget): Promise<boolean> {
    if (target.type === 'worldwide') return true;

    const location = await this.getCurrentLocation();
    if (!location) return false;

    const userLat = location.coords.latitude;

    if (target.type === 'countries' && target.countries) {
      // In real app, you would use a reverse geocoding service or country database
      // For demo, we assume user is in Kenya if latitude is roughly in East Africa
      return target.countries.some(country => 
        country.toLowerCase() === 'kenya' && userLat > -5 && userLat < 5
      );
    }

    if (target.type === 'regions' && target.regions) {
      // Simplified demo logic
      return target.regions.some(region => 
        region.toLowerCase() === 'nairobi' && userLat > -2 && userLat < 0
      );
    }

    return false;
  }

  // Calculate estimated reach for a Brew or Ad
  calculateEstimatedReach(target: GeoTarget): number {
    if (target.type === 'worldwide') return 25000000; // Global estimate

    if (target.type === 'countries' && target.countries) {
      return target.countries.length * 1200000; // Rough per-country estimate
    }

    if (target.type === 'regions' && target.regions) {
      return target.regions.length * 80000;
    }

    return 0;
  }

  // Format target for display in UI
  formatTargetForDisplay(target: GeoTarget): string {
    if (target.type === 'worldwide') return '🌍 Worldwide';

    if (target.type === 'countries' && target.countries) {
      return `📍 ${target.countries.join(', ')}`;
    }

    if (target.type === 'regions' && target.regions) {
      return `📍 ${target.regions.join(', ')}`;
    }

    return 'Unknown target';
  }
}

// Export singleton instance
export const geoTargeting = new GeoTargetingService();

// Export individual methods for easy use in screens
export const {
  requestLocationPermission,
  getCurrentLocation,
  validateTarget,
  isUserInTarget,
  calculateEstimatedReach,
  formatTargetForDisplay,
} = geoTargeting;

export default geoTargeting;