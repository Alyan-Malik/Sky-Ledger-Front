// src/types/airport.ts

export interface Airport {
  id: number;
  iata: string;
  airport_name: string;
  city: string;
  country: string;
  full_name: string;
  location: string;
}

export interface AirportSearchResponse {
  data: Airport[];
}