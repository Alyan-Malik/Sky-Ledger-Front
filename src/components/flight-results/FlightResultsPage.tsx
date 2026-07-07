// src/components/flight-results/FlightResultsPage.tsx

import React, { useState } from 'react';
import { FlightOffer } from '../../types/flight-offer';
import { FlightCard } from './FlightCard';
import { FlightResultsSkeleton } from './FlightCardSkeleton';
import { FlightSearchError, NoFlightsFound } from './FlightResultsStates';
import { useSearchState } from '../../hooks/useSearchState';
import { useSelectFlight } from '../../hooks/useSelectFlight';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';

export const FlightResultsPage: React.FC = () => {
  const { 
    searchResults: offers, 
    isLoading, 
    error, 
    searchId, 
    searchData,
    hasSearched 
  } = useSearchState();
  
  const { selectFlight, loading: selectingFlight } = useSelectFlight();
  
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [filterStops, setFilterStops] = useState<number | null>(null);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  // Loading state
  if (isLoading && !hasSearched) {
    return <FlightResultsSkeleton />;
  }

  // Error state
  if (error && hasSearched) {
    return (
      <FlightSearchError 
        message={error} 
        onRetry={() => {
          useSearchState.getState().clearSearch();
          window.history.back();
        }} 
      />
    );
  }

  // Empty state
  if (hasSearched && (!offers || offers.length === 0)) {
    return <NoFlightsFound onModifySearch={() => window.history.back()} />;
  }

  // Filter and sort offers
  const filteredOffers = (offers || [])
    .filter(offer => filterStops === null || (offer.stops?.count || 0) <= filterStops)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.grand_total || a.pricing?.grand_total || 0) - (b.grand_total || b.pricing?.grand_total || 0);
        case 'duration':
          return (a.route?.duration || '').localeCompare(b.route?.duration || '');
        case 'departure':
          return (a.route?.departure_time || '').localeCompare(b.route?.departure_time || '');
        default:
          return 0;
      }
    });

  const handleSelectFlight = async (offer: FlightOffer) => {
    if (!searchId) {
      console.error('No search ID available');
      return;
    }

    // Call the selectFlight function from the hook
    // This will save the flight and navigate to booking page
    await selectFlight(offer, searchId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Results Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredOffers.length} Flight{filteredOffers.length !== 1 ? 's' : ''} Found
            </h2>
            {searchData && (
              <p className="text-sm text-slate-500 mt-1">
                {searchData.origin_iata} → {searchData.destination_iata} • {searchData.departure_date}
              </p>
            )}
          </div>
          
          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="price">Price: Lowest</option>
                <option value="duration">Duration: Shortest</option>
                <option value="departure">Departure: Earliest</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={filterStops === null ? '' : filterStops}
                onChange={(e) => setFilterStops(e.target.value ? Number(e.target.value) : null)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Stops</option>
                <option value="0">Direct Only</option>
                <option value="1">1 Stop Max</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => (
          <FlightCard
            key={offer.id}
            offer={offer}
            onSelect={handleSelectFlight}
            isExpanded={expandedOfferId === offer.id}
            onToggleExpand={() => 
              setExpandedOfferId(expandedOfferId === offer.id ? null : offer.id)
            }
            isSelecting={selectingFlight}
          />
        ))}
      </div>
    </div>
  );
};