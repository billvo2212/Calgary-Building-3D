import { useState, useEffect } from 'react';
import { buildingAPI } from '../services/api';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await buildingAPI.fetchBuildings();
      
      if (response.success) {
        setBuildings(response.data);
      } else {
        setError(response.error || 'Failed to load buildings');
      }
    } catch (err) {
      setError(err.message || 'Failed to load buildings');
      console.error('Error loading buildings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buildings,
    isLoading,
    error,
    refetch: loadBuildings
  };
};