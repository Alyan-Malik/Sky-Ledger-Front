// src/services/flight-service.ts

import api from '../api/axios';
import { Airport } from '../types/airport';
import { FlightSearchFormData, FlightSearchResponse } from '../types/flight-search';

class FlightService {
  /**
   * Search airports with debouncing handled by the hook
   */
  async searchAirports(query: string): Promise<Airport[]> {
    const response = await api.get('/airports/search', {
      params: { q: query },
    });
    return response.data.data;
  }

  /**
   * Save flight search
   */
  async saveFlightSearch(data: FlightSearchFormData): Promise<FlightSearchResponse> {
    const response = await api.post('/flight-searches', data);
    return response.data;
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(page: number = 1, perPage: number = 10): Promise<any> {
    const response = await api.get('/flight-searches', {
      params: { page, per_page: perPage },
    });
    return response.data;
  }
}

export const flightService = new FlightService();