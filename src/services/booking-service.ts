// src/services/booking-service.ts

import api from '../api/axios';
import { Booking, BookingsResponse, CreateBookingFormData } from '../types/booking';
import { SelectedFlight } from '../types/selected-flight';

class BookingService {
  /**
   * Select a flight - UPDATED endpoint
   */
  async selectFlight(data: any): Promise<{ success: boolean; message: string; data: SelectedFlight }> {
    try {
      console.log('BookingService.selectFlight - Request data:', data);
      
      // CHANGED: from '/flight-offers/select' to '/selected-flights'
      const response = await api.post('/selected-flights', data);
      
      console.log('BookingService.selectFlight - Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('BookingService.selectFlight - Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get selected flight details
   */
  async getSelectedFlight(id: number): Promise<{ success: boolean; data: SelectedFlight }> {
    try {
      console.log('BookingService.getSelectedFlight - Fetching ID:', id);
      
      const response = await api.get(`/selected-flights/${id}`);
      
      console.log('BookingService.getSelectedFlight - Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('BookingService.getSelectedFlight - Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a new booking
   */
  async createBooking(
    selectedFlightId: number,
    data: CreateBookingFormData
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    try {
      console.log('BookingService.createBooking - Request:', { selectedFlightId, data });
      
      const response = await api.post(`/bookings/${selectedFlightId}`, data);
      
      console.log('BookingService.createBooking - Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('BookingService.createBooking - Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all bookings for user
   */
  async getBooking(id: number): Promise<{ success: boolean; data: Booking }> {
  try {
    console.log('BookingService.getBooking - Fetching ID:', id);
    
    const response = await api.get(`/bookings/${id}`);
    
    console.log('BookingService.getBooking - Response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('BookingService.getBooking - Error:', error.response?.data || error.message);
    throw error;
  }
}

  /**
   * Cancel booking
   */
  async cancelBooking(id: number): Promise<{ success: boolean; message: string; data: Booking }> {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  }


  /**
   * Get all bookings with search and pagination
   */
  async getBookings(params?: {
    q?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<BookingsResponse> {
    const response = await api.get('/bookings', { params });
    return response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(
    id: number,
    data: Partial<CreateBookingFormData>
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  }

  /**
   * Delete booking
   */
  async deleteBooking(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: number,
    status: string
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  }
}

export const bookingService = new BookingService();