// src/services/flight-offers-service.ts

import api from '../api/axios';
import { FlightSearchFormData } from '../types/flight-search';
import { FlightSearchResponse, FlightOffer } from '../types/flight-offer';

class FlightOffersService {
  /**
   * Search flights with Duffel integration
   */
  async searchFlights(data: FlightSearchFormData): Promise<FlightSearchResponse> {
    const response = await api.post('/flight-offers/search', data);
    return response.data;
  }

  /**
   * Get offer details by ID
   */
  async getOfferDetails(offerId: string): Promise<FlightOffer> {
    const response = await api.get(`/flight-offers/${offerId}`);
    return response.data.data;
  }

  // REMOVED: selectOffer method - this is now in bookingService
  // The old method was calling /flight-offers/select which no longer exists
}

export const flightOffersService = new FlightOffersService();