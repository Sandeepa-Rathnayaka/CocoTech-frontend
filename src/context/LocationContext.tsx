import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getLocations } from '../api/locationApi';
import { Location } from '../types';

interface LocationContextType {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  refreshLocations: () => Promise<void>;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedLocations = await getLocations();
      setLocations(fetchedLocations);
    } catch (err) {
      console.error('Failed to load locations:', err);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const refreshLocations = async () => {
    await loadLocations();
  };

  const value = {
    locations,
    isLoading,
    error,
    refreshLocations,
    selectedLocation,
    setSelectedLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};