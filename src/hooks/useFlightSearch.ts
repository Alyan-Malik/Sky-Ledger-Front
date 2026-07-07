// src/hooks/useFlightSearch.ts

import { useState, useCallback } from 'react';
import { FlightSearchFormData, ValidationErrors } from '../types/flight-search';
import { flightService } from '../services/flight-service';

interface UseFlightSearchReturn {
  loading: boolean;
  errors: ValidationErrors;
  saveSearch: (data: FlightSearchFormData) => Promise<any>;
  clearErrors: () => void;
}

export function useFlightSearch(): UseFlightSearchReturn {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const saveSearch = useCallback(async (data: FlightSearchFormData) => {
    try {
      setLoading(true);
      setErrors({});
      const response = await flightService.saveFlightSearch(data);
      return response;
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    loading,
    errors,
    saveSearch,
    clearErrors,
  };
}