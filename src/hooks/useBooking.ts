// src/hooks/useBooking.ts

import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Booking, CreateBookingFormData } from '../types/booking';
import { SelectedFlight } from '../types/selected-flight';
import { bookingService } from '../services/booking-service';

interface UseBookingReturn {
  loading: boolean;
  error: string | null;
  createBooking: (selectedFlightId: number, data: CreateBookingFormData) => Promise<Booking | null>;
  cancelBooking: (bookingId: number) => Promise<void>;
}

export function useBooking(): UseBookingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
//   const { toast } = useToast();
  const navigate = useNavigate();

  const createBooking = useCallback(async (
    selectedFlightId: number,
    data: CreateBookingFormData
  ): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating booking for flight:', selectedFlightId, data);

      const response = await bookingService.createBooking(selectedFlightId, data);

      console.log('Booking response:', response);

      if (response.success && response.data) {
        const bookingId = response.data.id;
        
               toast.success('Booking Confirmed!', {
          description: `Booking ${response.data.booking_id} has been created successfully.`,
        });


        // Navigate to ticket page with the booking ID
        console.log('Navigating to ticket:', `/dashboard/ticket/${bookingId}`);
        
        navigate({
          to: '/dashboard/ticket/$bookingId',
          params: { bookingId: bookingId.toString() },
        });

        return response.data;
      }

      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking.';
      setError(errorMessage);
      
            toast.error('Booking Failed', {
        description: errorMessage,
      });

      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, navigate]);

  const cancelBooking = useCallback(async (bookingId: number) => {
    try {
      setLoading(true);
      const response = await bookingService.cancelBooking(bookingId);

      if (response.success) {
               toast.success('Booking Cancelled', {
          description: 'Your booking has been cancelled successfully.',
        });

        
        navigate({ to: '/dashboard/search' });
      }
    } catch (err: any) {
            toast.error('Error', {
        description: err.response?.data?.message || 'Failed to cancel booking.',
      });

    } finally {
      setLoading(false);
    }
  }, [toast, navigate]);

  return {
    loading,
    error,
    createBooking,
    cancelBooking,
  };
}