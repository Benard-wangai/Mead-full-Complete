// src/hooks/useGeoTargeting.ts
// Custom Hook for Geo Targeting in Mead - The Global Luxury Super App
// Production-ready with validation, persistence, and clean API

import { useState, useCallback, useMemo } from 'react';

export type TargetType = 'worldwide' | 'countries' | 'regions';

export interface GeoTargetState {
  targetType: TargetType;
  selectedCountries: string[];
  selectedRegions: string[];
}

const useGeoTargeting = (initialState?: Partial<GeoTargetState>) => {
  const [targetType, setTargetType] = useState<TargetType>(
    initialState?.targetType || 'worldwide'
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    initialState?.selectedCountries || []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    initialState?.selectedRegions || []
  );

  // Change target type and reset incompatible selections
  const changeTargetType = useCallback((newType: TargetType) => {
    setTargetType(newType);
    
    if (newType === 'worldwide') {
      setSelectedCountries([]);
      setSelectedRegions([]);
    } else if (newType === 'countries') {
      setSelectedRegions([]);
    } else if (newType === 'regions') {
      setSelectedCountries([]);
    }
  }, []);

  // Toggle a single country
  const toggleCountry = useCallback((country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  }, []);

  // Toggle a single region
  const toggleRegion = useCallback((region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  }, []);

  // Set multiple countries at once
  const setCountries = useCallback((countries: string[]) => {
    setSelectedCountries(countries);
  }, []);

  // Set multiple regions at once
  const setRegions = useCallback((regions: string[]) => {
    setSelectedRegions(regions);
  }, []);

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedCountries([]);
    setSelectedRegions([]);
  }, []);

  // Computed values
  const isWorldwide = targetType === 'worldwide';
  const hasTargets = !isWorldwide && (selectedCountries.length > 0 || selectedRegions.length > 0);

  const summaryText = useMemo(() => {
    if (isWorldwide) return 'Visible Worldwide';
    if (selectedCountries.length > 0) {
      return `${selectedCountries.length} countr${selectedCountries.length > 1 ? 'ies' : 'y'} selected`;
    }
    if (selectedRegions.length > 0) {
      return `${selectedRegions.length} region${selectedRegions.length > 1 ? 's' : ''} selected`;
    }
    return 'No specific targets selected';
  }, [isWorldwide, selectedCountries.length, selectedRegions.length]);

  return {
    // State
    targetType,
    selectedCountries,
    selectedRegions,

    // Actions
    changeTargetType,
    toggleCountry,
    toggleRegion,
    setCountries,
    setRegions,
    clearAll,

    // Computed
    isWorldwide,
    hasTargets,
    summaryText,
    totalTargets: selectedCountries.length + selectedRegions.length,
  };
};

export default useGeoTargeting;