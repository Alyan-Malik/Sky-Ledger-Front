// src/hooks/useSearchState.ts

import { create } from 'zustand';
import { FlightSearchFormData } from '../types/flight-search';
import { FlightOffer } from '../types/flight-offer';

interface SearchState {
  // Search data
  searchData: FlightSearchFormData | null;
  
  // Results
  searchResults: FlightOffer[];
  searchId: number | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Actions
  setSearchData: (data: FlightSearchFormData) => void;
  setSearchResults: (results: FlightOffer[], searchId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
  setHasSearched: (searched: boolean) => void;
}

export const useSearchState = create<SearchState>((set) => ({
  // Initial state
  searchData: null,
  searchResults: [],
  searchId: null,
  isLoading: false,
  error: null,
  hasSearched: false,
  
  // Actions
  setSearchData: (data) => set({ 
    searchData: data,
    hasSearched: false, // Reset when new search starts
  }),
  
  setSearchResults: (results, searchId) => set({ 
    searchResults: results, 
    searchId,
    error: null,
    isLoading: false,
    hasSearched: true,
  }),
  
  setLoading: (loading) => set({ 
    isLoading: loading,
    // Only reset hasSearched if starting a new search
    ...(loading ? { hasSearched: false, error: null } : {}),
  }),
  
  setError: (error) => set({ 
    error, 
    searchResults: [],
    isLoading: false,
    hasSearched: true,
  }),
  
  clearSearch: () => set({
    searchData: null,
    searchResults: [],
    searchId: null,
    isLoading: false,
    error: null,
    hasSearched: false,
  }),
  
  setHasSearched: (searched) => set({ hasSearched: searched }),
}));