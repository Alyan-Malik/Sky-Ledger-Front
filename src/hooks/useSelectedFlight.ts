// src/hooks/useSelectFlight.ts

import { useState, useCallback } from 'react';
import { FlightOffer } from '../types/flight-offer';
import { SelectedFlight } from '../types/selected-flight';
import { bookingService } from '../services/booking-service';
import { toast } from "sonner";
import { useNavigate } from '@tanstack/react-router';

interface UseSelectFlightReturn {
  loading: boolean;
  selectedFlight: SelectedFlight | null;
  selectFlight: (offer: FlightOffer, searchId: number) => Promise<void>;
}

export function useSelectFlight(): UseSelectFlightReturn {
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<SelectedFlight | null>(null);
//   const { toast } = useToast();
  const navigate = useNavigate();

  const selectFlight = useCallback(async (offer: FlightOffer, searchId: number) => {
    try {
      setLoading(true);

      console.log('Selecting flight:', {
        offerId: offer.id,
        searchId: searchId,
        airline: offer.airline?.name,
        flightNumber: offer.flight_number,
      });

      // Prepare the data for the API
      const selectFlightData = {
        flight_search_id: searchId,
        offer_id: offer.id,
        airline_name: offer.airline?.name || 'Unknown Airline',
        airline_iata: offer.airline?.iata_code || '',
        airline_logo: offer.airline?.logo_url || undefined,
        flight_number: offer.flight_number || '',
        origin_iata: offer.route?.origin?.iata || '',
        origin_airport: offer.route?.origin?.airport || '',
        origin_city: offer.route?.origin?.city || '',
        destination_iata: offer.route?.destination?.iata || '',
        destination_airport: offer.route?.destination?.airport || '',
        destination_city: offer.route?.destination?.city || '',
        departure_time: offer.route?.departure_time || '',
        arrival_time: offer.route?.arrival_time || '',
        duration: offer.route?.duration || '',
        stops: offer.stops?.count || 0,
        cabin_class: offer.cabin?.class || 'Economy',
        base_price: offer.pricing?.base_amount || offer.pricing?.base_fare || 0,
        currency: offer.pricing?.currency || 'USD',
        service_charge: offer.service_charge || offer.pricing?.service_charge || 0,
        grand_total: offer.grand_total || offer.pricing?.grand_total || 0,
        offer_data: offer, // Pass the complete offer data
      };

      console.log('Sending select flight request:', selectFlightData);

      // Call the API to save the selected flight
      const response = await bookingService.selectFlight(selectFlightData);

      console.log('Select flight response:', response);

      if (response.success) {
        setSelectedFlight(response.data);
        
                toast.success('Flight Selected!', {
          description: `${offer.airline?.name} - ${offer.flight_number} has been selected. Redirecting to booking...`,
        });


        // Navigate to the booking page with the selected flight ID
        navigate({
          to: '/dashboard/booking/$selectedFlightId',
          params: { 
            selectedFlightId: response.data.id.toString() 
          },
        });
      } else {
                toast.error('Error', {
          description: response.message || 'Failed to select flight. Please try again.',
        });

      }
    } catch (err: any) {
      console.error('Select flight error:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to select flight. Please try again.';
      
            toast.error('Selection Failed', {
        description: errorMessage,
      });

    } finally {
      setLoading(false);
    }
  }, [toast, navigate]);

  return {
    loading,
    selectedFlight,
    selectFlight,
  };
}