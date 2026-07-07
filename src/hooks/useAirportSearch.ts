// src/hooks/useAirportSearch.ts

import { useState, useCallback, useRef, useEffect } from 'react';
import { Airport } from '../types/airport';
import { flightService } from '../services/flight-service';

interface UseAirportSearchReturn {
  airports: Airport[];
  loading: boolean;
  error: string | null;
  searchAirports: (query: string) => void;
  clearAirports: () => void;
}

export function useAirportSearch(): UseAirportSearchReturn {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const searchAirports = useCallback(async (query: string) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search if query is too short
    if (query.length < 2) {
      setAirports([]);
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await flightService.searchAirports(query);
        setAirports(results);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(err.message || 'Failed to search airports');
          setAirports([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearAirports = useCallback(() => {
    setAirports([]);
    setError(null);
  }, []);

  return {
    airports,
    loading,
    error,
    searchAirports,
    clearAirports,
  };
}