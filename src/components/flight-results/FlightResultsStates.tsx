// src/components/flight-results/FlightResultsStates.tsx

import React from 'react';
import { 
  AlertTriangle, 
  Plane, 
  Wifi, 
  Clock, 
  Search,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const FlightSearchError: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative mb-6">
        <AlertTriangle className="h-16 w-16 text-red-400" />
        <div className="absolute -bottom-2 -right-2 bg-red-100 rounded-full p-2">
          <Wifi className="h-5 w-5 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Search Failed
      </h3>
      <p className="text-slate-600 text-center max-w-md mb-6">
        {message}
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        )}
        <Button variant="outline" onClick={() => window.history.back()}>
          Modify Search
        </Button>
      </div>
    </div>
  );
};

export const NoFlightsFound: React.FC<{ onModifySearch?: () => void }> = ({ onModifySearch }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative mb-6">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center">
          <Plane className="h-12 w-12 text-slate-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-amber-100 rounded-full p-2">
          <Search className="h-5 w-5 text-amber-500" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        No Flights Found
      </h3>
      <p className="text-slate-600 text-center max-w-md mb-4">
        We couldn't find any flights matching your search criteria. 
        Try adjusting your dates or choosing different airports.
      </p>
      <div className="bg-slate-50 rounded-lg p-4 mb-6 max-w-md w-full">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Suggestions:</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            Try different dates (flexible dates often have more options)
          </li>
          <li className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            Consider nearby airports
          </li>
          <li className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            Remove any filters you may have applied
          </li>
        </ul>
      </div>
      {onModifySearch && (
        <Button onClick={onModifySearch}>
          Modify Search
        </Button>
      )}
    </div>
  );
};

export const FlightSearchTimeout: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative mb-6">
        <Clock className="h-16 w-16 text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Search Taking Too Long
      </h3>
      <p className="text-slate-600 text-center max-w-md mb-6">
        The flight search is taking longer than expected. 
        This might be due to high demand or network issues.
      </p>
      <div className="flex gap-3">
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry Search
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
};