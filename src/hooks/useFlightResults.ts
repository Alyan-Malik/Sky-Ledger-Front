// src/hooks/useFlightResults.ts

import { useState, useCallback } from 'react';
import { FlightSearchResponse, FlightOffer } from '../types/flight-offer';
import { FlightSearchFormData } from '../types/flight-search';
import { flightOffersService } from '../services/flight-offers-service';

interface UseFlightResultsReturn {
  offers: FlightOffer[];
  loading: boolean;
  error: string | null;
  searchId: number | null;
  searchFlights: (data: FlightSearchFormData) => Promise<FlightSearchResponse | null>;
}

export function useFlightResults(): UseFlightResultsReturn {
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<number | null>(null);

  const searchFlights = useCallback(async (data: FlightSearchFormData): Promise<FlightSearchResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await flightOffersService.searchFlights(data);
      
      console.log('Flight search response:', response);

      if (response.success) {
        const foundOffers = response.data?.offers || [];
        console.log(`Found ${foundOffers.length} offers`);
        
        setOffers(foundOffers);
        setSearchId(response.data?.search?.id || null);
        
        if (foundOffers.length === 0) {
          setError('No flights found for the selected criteria.');
        }
        
        return response;
      } else {
        setError(response.message || 'No flights found');
        setOffers([]);
        return null;
      }
    } catch (err: any) {
      console.error('Flight search error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to search flights. Please try again.';
      setError(errorMessage);
      setOffers([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    loading,
    error,
    searchId,
    searchFlights,
  };
}