// src/types/flight-search.ts

import { Airport } from './airport';

export type TripType = 'one_way' | 'round_trip';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface FlightSearchFormData {
  trip_type: TripType;
  origin_iata: string;
  destination_iata: string;
  departure_date: string;
  return_date?: string | null;
  adults: number;
  children: number;
  infants: number;
  cabin_class: CabinClass;
}

export interface FlightSearchPassengers {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

export interface FlightSearchResult {
  id: number;
  trip_type: TripType;
  origin: Airport;
  destination: Airport;
  departure_date: string;
  return_date: string | null;
  passengers: FlightSearchPassengers;
  cabin_class: CabinClass;
  created_at: string;
}

export interface FlightSearchResponse {
  message: string;
  data: FlightSearchResult;
}

export interface ValidationErrors {
  [key: string]: string[];
}

export interface ApiError {
  message: string;
  errors?: ValidationErrors;
}