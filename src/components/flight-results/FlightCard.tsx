// src/components/flight-results/FlightCard.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Clock, Plane, Luggage, ChevronDown, ChevronUp, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { FlightOffer } from '../../types/flight-offer';
import { formatDuration, formatTime, formatCurrency } from '../../lib/formatters';
import { FlightDetails } from './FlightDetails';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface FlightCardProps {
  offer: FlightOffer;
  onSelect: (offer: FlightOffer) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSelecting: boolean;
}


interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FlightDetails Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="border-t border-slate-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Unable to display flight details</p>
              <p className="text-sm text-red-600 mt-1">
                Something went wrong loading these details. Please try again.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const FlightCard: React.FC<FlightCardProps> = ({ 
  offer, 
  onSelect, 
  isExpanded, 
  onToggleExpand,
  isSelecting 
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="p-6">
        {/* Airline & Price Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {offer.airline?.logo_url ? (
              <img
                src={offer.airline.logo_url}
                alt={offer.airline.name}
                className="h-12 w-12 object-contain rounded-lg bg-slate-50 p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Plane className="h-6 w-6 text-slate-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {offer.airline?.name || 'Unknown Airline'}
              </h3>
              <p className="text-sm text-slate-500">
                Flight {offer.flight_number || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(offer.grand_total || 0, offer.pricing?.currency || 'USD')}
            </p>
            <p className="text-xs text-slate-500">Total price incl. taxes & fees</p>
          </div>
        </div>

        {/* Route & Time */}
        <div className="flex items-center justify-between py-6 border-t border-slate-100">
          {/* Departure */}
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {formatTime(offer.route?.departure_time || '')}
            </p>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {offer.route?.origin?.iata || 'N/A'}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[120px] mx-auto">
              {offer.route?.origin?.city || ''}
            </p>
          </div>

          {/* Duration & Stops */}
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="text-xs text-slate-500 mb-1 font-medium">
              {formatDuration(offer.route?.duration || '')}
            </div>
            <div className="relative w-full h-[2px] bg-slate-200 my-2">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow"></div>
              {(offer.stops?.count || 0) > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border-2 border-white shadow"></div>
              )}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow"></div>
            </div>
            <Badge 
              variant={(offer.stops?.count || 0) === 0 ? 'secondary' : 'outline'} 
              className="text-xs font-medium"
            >
              {(offer.stops?.count || 0) === 0 ? 'Direct Flight' : `${offer.stops?.count} Stop${offer.stops?.count > 1 ? 's' : ''}`}
            </Badge>
          </div>

          {/* Arrival */}
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {formatTime(offer.route?.arrival_time || '')}
            </p>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {offer.route?.destination?.iata || 'N/A'}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[120px] mx-auto">
              {offer.route?.destination?.city || ''}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          {/* Baggage */}
          {offer.baggage?.checked?.[0] && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Luggage className="h-4 w-4 text-slate-400" />
              <span>{offer.baggage.checked[0].quantity}x Checked Bag</span>
            </div>
          )}
          
          {/* Cabin Class */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="h-4 w-4 text-slate-400" />
            <span>{offer.cabin?.class || 'Economy'}</span>
          </div>

          {/* Refundable Status */}
          <div className="flex items-center gap-2 text-sm">
            {offer.conditions?.refundable ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-medium">Refundable</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-600">Non-refundable</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
  <Button
    variant="outline"
    onClick={onToggleExpand}
    className="flex-1"
    disabled={isSelecting}
  >
    {isExpanded ? (
      <>
        <ChevronUp className="h-4 w-4 mr-2" /> Hide Details
      </>
    ) : (
      <>
        <ChevronDown className="h-4 w-4 mr-2" /> View Details
      </>
    )}
  </Button>
  <Button
    onClick={() => onSelect(offer)}
    disabled={isSelecting}
    className="flex-1"
  >
    {isSelecting ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Selecting...
      </>
    ) : (
      'Select Flight'
    )}
  </Button>
</div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <ErrorBoundary>
          <FlightDetails offer={offer} />
        </ErrorBoundary>
      )}
    </div>
  );
};