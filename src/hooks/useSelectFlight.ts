// src/hooks/useSelectFlight.ts

import { useState, useCallback } from 'react';
import { FlightOffer } from '../types/flight-offer';
import { SelectedFlight } from '../types/selected-flight';
import { bookingService } from '../services/booking-service';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface UseSelectFlightReturn {
  loading: boolean;
  selectedFlight: SelectedFlight | null;
  selectFlight: (offer: FlightOffer, searchId: number) => Promise<void>;
}

export function useSelectFlight(): UseSelectFlightReturn {
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<SelectedFlight | null>(null);
  const navigate = useNavigate();

  const selectFlight = useCallback(async (offer: FlightOffer, searchId: number) => {
    try {
      setLoading(true);

      console.log('=== SELECT FLIGHT DEBUG ===');
      console.log('Full offer object:', offer);
      console.log('Pricing details:', {
        base_amount: offer.pricing?.base_amount,
        base_fare: offer.pricing?.base_fare,
        tax_amount: offer.pricing?.tax_amount,
        total_amount: offer.pricing?.total_amount,
        service_charge: offer.service_charge || offer.pricing?.service_charge,
        grand_total: offer.grand_total || offer.pricing?.grand_total,
        currency: offer.pricing?.currency,
      });

      // IMPORTANT: Use the correct base price (without taxes)
      // base_amount/base_fare = base fare WITHOUT taxes
      // total_amount = base fare + taxes
      // grand_total = total_amount + service_charge
      const baseAmount = Number(offer.pricing?.base_amount || offer.pricing?.base_fare || 0);
      const taxAmount = Number(offer.pricing?.tax_amount || 0);
      const totalAmount = Number(offer.pricing?.total_amount || 0);
      const serviceCharge = Number(offer.service_charge || offer.pricing?.service_charge || 0);
      const grandTotal = Number(offer.grand_total || offer.pricing?.grand_total || 0);
      const currency = (offer.pricing?.currency || 'USD').trim().toUpperCase();

      console.log('Calculated pricing:', {
        baseAmount,
        taxAmount,
        totalAmount,
        serviceCharge,
        grandTotal,
      });

      // Ensure airline_iata is a string and trimmed
      const airlineIata = (offer.airline?.iata_code || 'ZZ').trim().toUpperCase();
      
      // Build the request payload with proper data formatting
      const payload = {
        flight_search_id: searchId,
        offer_id: offer.id || '',
        airline_name: offer.airline?.name || 'Unknown Airline',
        airline_iata: airlineIata,
        airline_logo: offer.airline?.logo_url || null,
        flight_number: offer.flight_number || '0000',
        origin_iata: (offer.route?.origin?.iata || 'XXX').trim().toUpperCase(),
        origin_airport: offer.route?.origin?.airport || 'Unknown Airport',
        origin_city: offer.route?.origin?.city || 'Unknown City',
        destination_iata: (offer.route?.destination?.iata || 'XXX').trim().toUpperCase(),
        destination_airport: offer.route?.destination?.airport || 'Unknown Airport',
        destination_city: offer.route?.destination?.city || 'Unknown City',
        departure_time: offer.route?.departure_time || new Date().toISOString(),
        arrival_time: offer.route?.arrival_time || new Date().toISOString(),
        duration: offer.route?.duration || 'PT0M',
        stops: offer.stops?.count || 0,
        cabin_class: offer.cabin?.class || 'Economy',
        
        // Send the CORRECT pricing values
        base_price: baseAmount,           // Base fare without taxes
        currency: currency,
        service_charge: serviceCharge,    // Our markup
        grand_total: grandTotal,          // Total including everything
        
        offer_data: offer,
      };

      console.log('Payload being sent:', {
        base_price: payload.base_price,
        service_charge: payload.service_charge,
        grand_total: payload.grand_total,
        currency: payload.currency,
      });

      console.log('airline_iata value:', payload.airline_iata, 'length:', payload.airline_iata.length);
      console.log('origin_iata value:', payload.origin_iata, 'length:', payload.origin_iata.length);
      console.log('destination_iata value:', payload.destination_iata, 'length:', payload.destination_iata.length);

      // Call the API
      const response = await bookingService.selectFlight(payload);

      console.log('API Response:', response);

      if (response.success && response.data) {
        setSelectedFlight(response.data);
        
        const flightId = response.data.id;
        
        toast.success('Flight Selected!', {
          description: `${payload.airline_name} - ${payload.flight_number} selected. Redirecting...`,
        });

        navigate({
          to: '/dashboard/booking/$selectedFlightId',
          params: { selectedFlightId: flightId.toString() },
        });
      } else {
        throw new Error(response.message || 'Failed to select flight');
      }
    } catch (err: any) {
      console.error('=== SELECT FLIGHT ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);
      
      // Show specific validation errors if available
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join('\n');
        
        toast.error('Validation Error', {
          description: errorMessages,
        });
      } else {
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Failed to select flight. Please try again.';
        
        toast.error('Selection Failed', {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    loading,
    selectedFlight,
    selectFlight,
  };
}