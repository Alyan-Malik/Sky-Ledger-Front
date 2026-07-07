// src/types/flight-offer.ts

export interface AirlineInfo {
  name: string;
  iata_code: string;
  logo_url: string | null;
}

export interface AirportInfo {
  iata: string;
  city: string;
  airport: string;
}

export interface RouteInfo {
  origin: AirportInfo;
  destination: AirportInfo;
  departure_time: string;
  arrival_time: string;
  duration: string;
}

export interface LayoverInfo {
  airport: string;
  airport_name: string;
  city: string;
  duration: string;
  arrival_time: string;
  departure_time: string;
}

export interface SegmentInfo {
  id: string;
  flight_number: string;
  airline_name: string;
  airline_iata: string;
  aircraft: string | null;
  origin: {
    iata: string;
    airport: string;
    city: string;
    terminal: string | null;
  };
  destination: {
    iata: string;
    airport: string;
    city: string;
    terminal: string | null;
  };
  departure_time: string;
  arrival_time: string;
  duration: string;
  cabin_class: string;
  fare_basis: string;
  baggage: {
    checked: number;
    type: string;
    cabin?: number | null;
  };
  distance?: number | string | null;
}

export interface FlightOffer {
  id: string;
  airline: AirlineInfo;
  flight_number: string;
  route: RouteInfo;
  stops: {
    count: number;
    details: LayoverInfo[];
  };
  pricing: {
    base_amount: number;
    currency: string;
    tax_amount: number;
    base_fare: number;
    service_charge?: number;
    grand_total?: number;
    total_amount?: number;
  };
  cabin: {
    class: string;
    marketing_class: string | null;
    fare_basis: string | null;
  };
  baggage: {
    checked: BaggageInfo[];
    cabin: BaggageInfo[];
  };
  conditions: {
    refundable: boolean;
    changeable: boolean;
    penalties: any;
    refund_before_departure?: {
      penalty_amount?: number;
      penalty_currency?: string | null;
    } | null;
  };
  segments: SegmentInfo[];
  return_slice: {
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    stops: number;
    segments: SegmentInfo[];
  } | null;
  service_charge: number;
  grand_total: number;
  total_emissions_kg?: number;
}

export interface BaggageInfo {
  quantity: number;
  type: string;
}

export interface FlightSearchResult {
  search: any;
  offers: FlightOffer[];
}

export interface FlightSearchResponse {
  success: boolean;
  message: string;
  data: FlightSearchResult;
}