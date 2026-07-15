// src/types/booking.ts

// src/types/booking.ts

export interface Booking {
  id: number;
  booking_id: string;
  pnr_number: string | null;
  eticket_number: string | null;
  place_of_issue: string | null;
  iata_code: string | null;
  
  passenger: {
    first_name: string;
    last_name: string;
    full_name: string;
    gender: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    passport_number: string | null;
    passport_expiry: string | null;
    cnic: string | null;
  };
  
  additional_passengers?: AdditionalPassenger[];
  
  contact: {
    email: string;
    phone: string;
    emergency_contact: string | null;
  };
  
  address: {
    address: string | null;
    city: string | null;
    country: string | null;
    zip_code: string | null;
  };
  
  preferences: {
    seat_number: string | null;
    seat_preference: string | null;
    extra_legroom: boolean;
    economy_delight: boolean; // NEW
    meal_preference: string | null;
    special_assistance: string | null;
  };
  
  baggage: {
    checked_count: number;
    checked_kg: number; // NEW
    hand_luggage_count: number;
    hand_luggage_kg: number; // NEW
  };
  
  assistance?: {
    wheelchair: string;
    priority_pass: boolean;
  };
  
  flight: {
    airline?: {
      name: string;
      code?: string;
      logo?: string | null;
      iata_code?: string | null;
    };
    flight?: {
      number: string;
      cabin_class?: string;
      aircraft?: string | null;
      terminal?: string | null;
    };
    route?: {
      origin: { iata: string; city: string; airport?: string };
      destination: { iata: string; city: string; airport?: string };
    };
    schedule?: {
      departure: string;
      arrival: string;
      duration: string;
      stops?: number;
    };
    pricing?: {
      base_price: string;
      service_charge: string;
      total_price: string;
      currency: string;
    };
    // Return flight
    return_flight?: ReturnFlight | null;
    is_round_trip?: boolean;
    segments?: FlightSegment[];
  };
  
  status: {
    booking: string;
    ticket?: string;
  };
  
  remarks: string | null;
  created_at: string;
}
export interface CreateBookingFormData {
  // Primary Passenger
  passenger_first_name: string;
  passenger_last_name: string;
  gender: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  cnic?: string;
  
  // Contact
  email: string;
  phone: string;
  emergency_contact?: string;
  
  // Address
  address?: string;
  city?: string;
  country?: string;
  zip_code?: string;
  
  // Additional Passengers
  additional_passengers?: AdditionalPassenger[];
  
  // Baggage
  checked_baggage_count: number;
  hand_luggage_count: number;
  
  // Assistance
  wheelchair_required: 'none' | 'wheelchair' | 'special_assistance';
  priority_pass: boolean;
  
  // Preferences
  seat_number?: string;
  meal_preference?: string;
  special_assistance?: string;
  remarks?: string;
  
  // References
  booking_id?: string;
  pnr_number?: string;
  eticket_number?: string;

  // Seat preferences - NEW
  seat_preference?: 'window' | 'aisle' | 'middle' | '';
  extra_legroom?: boolean;
  
  // Baggage weight - NEW
  checked_baggage_kg?: number;
  hand_luggage_kg?: number;

  economy_delight?: boolean; // NEW
}

export interface AdditionalPassenger {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  passenger_type: 'adult' | 'child' | 'infant';
}


export interface BookingListItem {
  id: number;
  booking_id: string;
  pnr_number: string | null;
  eticket_number: string | null;
  
  passenger: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
  
  flight: {
    airline_name: string;
    airline_code: string;
    airline_logo: string | null;
    flight_number: string;
    origin_iata: string;
    destination_iata: string;
    departure_datetime: string;
    cabin_class: string;
    total_price: number;
    currency: string;
  };
  
  status: {
    booking: string;
    ticket: string;
  };
  
  created_at: string;
  updated_at: string;
}

export interface BookingsResponse {
  success: boolean;
  data: BookingListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}