// src/types/selected-flight.ts

export interface SelectedFlight {
  id: number;
  provider: string;
  duffel_offer_id: string;
  
  airline: {
    name: string;
    code: string;
    logo: string | null;
  };
  
  flight: {
    number: string;
    aircraft: string | null;
    terminal: string | null;
    cabin_class: string;
    fare_brand: string | null;
  };
  
  route: {
    origin: {
      iata: string;
      airport: string;
      city: string;
    };
    destination: {
      iata: string;
      airport: string;
      city: string;
    };
  };
  
  schedule: {
    departure: string;
    arrival: string;
    duration: string;
    stops: number;
  };
  
  pricing: {
    base_price: string;
    service_charge: string;
    total_price: string;
    currency: string;
  };
  
  // Passenger counts from original search
  passenger_counts: {
    adults: number;
    children: number;
    infants: number;
  };
  
  baggage: any;
  status: string;
  expires_at: string;
  created_at: string;
}


export interface ReturnFlight {
  origin: {
    iata: string;
    city: string;
    airport: string;
  };
  destination: {
    iata: string;
    city: string;
    airport: string;
  };
  departure_time: string | null;
  arrival_time: string | null;
  duration: string;
  stops: number;
  flight_number: string;
  segments: any[];
}

export interface SelectedFlight {
  id: number;
  provider: string;
  duffel_offer_id: string;
  
  airline: {
    name: string;
    code: string;
    logo: string | null;
  };
  
  flight: {
    number: string;
    aircraft: string | null;
    terminal: string | null;
    cabin_class: string;
    fare_brand: string | null;
  };
  
  route: {
    origin: {
      iata: string;
      airport: string;
      city: string;
    };
    destination: {
      iata: string;
      airport: string;
      city: string;
    };
  };
  
  schedule: {
    departure: string;
    arrival: string;
    duration: string;
    stops: number;
  };
  
  pricing: {
    base_price: string;
    service_charge: string;
    total_price: string;
    currency: string;
  };
  
  // Return flight data
  return_flight: ReturnFlight | null;
  is_round_trip: boolean;
  
  passenger_counts: {
    adults: number;
    children: number;
    infants: number;
  };
  
  baggage: any;
  status: string;
  expires_at: string;
  created_at: string;
}