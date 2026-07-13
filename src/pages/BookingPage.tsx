// src/pages/BookingPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { SelectedFlight } from '@/types/selected-flight';
import { CreateBookingFormData } from '@/types/booking';
import { bookingService } from '@/services/booking-service';
import { useBooking } from '@/hooks/useBooking';
import { FlightSummaryCard } from '@/components/booking/FlightSummaryCard';
import { PassengerForm } from '@/components/booking/PassengerForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BookingPage: React.FC = () => {
  const { selectedFlightId } = useParams({ from: '/dashboard/booking/$selectedFlightId' });
  const navigate = useNavigate();
  const { createBooking, loading: bookingLoading } = useBooking();
  
  const [selectedFlight, setSelectedFlight] = useState<SelectedFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFlightId) {
      fetchSelectedFlight();
    }
  }, [selectedFlightId]);

  const fetchSelectedFlight = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching selected flight:', selectedFlightId);
      
      const response = await bookingService.getSelectedFlight(Number(selectedFlightId));
      
      console.log('Selected flight response:', response);
      
      if (response.success && response.data) {
        setSelectedFlight(response.data);
        console.log('Passenger counts:', response.data.passenger_counts);
      } else {
        setError('Flight not found or has expired.');
      }
    } catch (err: any) {
      console.error('Failed to fetch selected flight:', err);
      setError(err.response?.data?.message || 'Failed to load flight details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: CreateBookingFormData) => {
    if (!selectedFlightId) return;
    
    const booking = await createBooking(Number(selectedFlightId), formData);
    
    if (booking) {
          toast.success('Booking Confirmed!', {
        description: `Your booking has been created successfully.`,
      });

    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-slate-600">Loading flight details...</p>
      </div>
    );
  }

  // Error state
  if (error || !selectedFlight) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {error || 'Flight Not Found'}
        </h3>
        <p className="text-slate-600 mb-4">
          The selected flight could not be loaded. It may have expired.
        </p>
        <Button onClick={() => navigate({ to: '/dashboard/search' })}>
          Search Flights Again
        </Button>
      </div>
    );
  }

  // Get passenger counts
  const passengerCounts = selectedFlight.passenger_counts || {
    adults: 1,
    children: 0,
    infants: 0,
  };

  console.log('Passenger counts for form:', passengerCounts);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Booking</h1>
        <p className="text-slate-500 mt-1">
          Review flight details and enter passenger information 
          ({passengerCounts.adults + passengerCounts.children + passengerCounts.infants} passenger(s))
        </p>
      </div>

      {/* Flight Summary Card */}
      <FlightSummaryCard flight={selectedFlight} />

      {/* Passenger Form */}
      <PassengerForm 
        onSubmit={handleSubmit}
        isSubmitting={bookingLoading}
        onCancel={() => navigate({ 
  to: '/dashboard/results' 
} as any)}
        totalPassengers={passengerCounts}
      />
    </div>
  );
};