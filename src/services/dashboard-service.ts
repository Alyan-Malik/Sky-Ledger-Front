// src/services/dashboard-service.ts

import { api } from '../api/axios';

export interface DashboardStats {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export interface RecentBooking {
  id: number;
  booking_id: string;
  passenger: string;
  airline_code: string;
  airline_name: string;
  airline_logo: string | null;
  flight_number: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface RecentSearch {
  id: number;
  route: string;
  origin: string;
  destination: string;
  pax: string;
  trip_type: string;
  departure_date: string;
  when: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats[];
  recent_bookings: RecentBooking[];
  recent_searches: RecentSearch[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardResponse> {
    const response = await api.get('/dashboard');
    return response.data;
  }
}

export const dashboardService = new DashboardService();