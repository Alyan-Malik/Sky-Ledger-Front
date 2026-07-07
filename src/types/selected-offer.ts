// src/types/selected-offer.ts

export interface AirportInfo {
  code: string;
  name: string;
  iata: string;
  city?: string;
  country?: string;
}

export interface SegmentInfo {
  origin: AirportInfo;
  destination: AirportInfo;
  departure: string;
  arrival: string;
  duration?: string;
  flight_number?: string;
  airline?: {
    name: string;
    iata: string;
    logo?: string | null;
  };
}

export interface SelectedOffer {
  id: number;
  airline: {
    name: string;
    iata: string;
    logo: string | null;
  };
  flight_number: string;
  route: {
    origin: AirportInfo;
    destination: AirportInfo;
  };
  schedule: {
    departure: string;
    arrival: string;
    duration: string;
  };
  pricing: {
    base_fare: number;
    service_charge: number;
    grand_total: number;
    currency: string;
  };
  details: {
    stops: number;
    cabin_class: string;
    baggage: any;
    segments: SegmentInfo[];
  };
  status: 'selected' | 'booked' | 'cancelled' | 'expired';
  expires_at: string;
}

export interface SelectedOfferResponse {
  success: boolean;
  message: string;
  data: SelectedOffer;
}