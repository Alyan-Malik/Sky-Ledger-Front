// src/lib/validators.ts

import { FlightSearchFormData } from '../types/flight-search';

export function validateFlightSearch(data: FlightSearchFormData): string[] {
  const errors: string[] = [];

  if (!data.origin_iata) {
    errors.push('Please select a departure airport');
  }

  if (!data.destination_iata) {
    errors.push('Please select an arrival airport');
  }

  if (data.origin_iata === data.destination_iata) {
    errors.push('Origin and destination must be different');
  }

  if (!data.departure_date) {
    errors.push('Please select a departure date');
  }

  if (data.trip_type === 'round_trip' && !data.return_date) {
    errors.push('Please select a return date for round trip');
  }

  if (data.adults < 1) {
    errors.push('At least one adult is required');
  }

  if (data.infants > data.adults) {
    errors.push('Infants cannot exceed number of adults');
  }

  return errors;
}

export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}