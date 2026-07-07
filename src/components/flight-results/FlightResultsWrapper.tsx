// src/components/flight-results/FlightResultsWrapper.tsx

import React, { useEffect } from 'react';
import { useSearchState } from '../../hooks/useSearchState';
import { FlightResultsPage } from './FlightResultsPage';
import { useNavigate } from '@tanstack/react-router';

export const FlightResultsWrapper: React.FC = () => {
  const { searchData, hasSearched } = useSearchState();
  const navigate = useNavigate();

  // If no search data, redirect to search page
  useEffect(() => {
    if (!searchData && !hasSearched) {
      // Check if we should redirect
      const timer = setTimeout(() => {
        if (!useSearchState.getState().searchData && !useSearchState.getState().hasSearched) {
          navigate({ to: '/dashboard/search' });
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [searchData, hasSearched, navigate]);

  return <FlightResultsPage />;
};