// src/components/flight-results/FlightDetails.tsx

import React from 'react';
import { FlightOffer, SegmentInfo } from '../../types/flight-offer';
import { formatTime, formatDuration, formatDate, formatCurrency } from '../../lib/formatters';
import { Plane, Clock, MapPin, Luggage, Coffee, Info, ShieldAlert } from 'lucide-react';

interface FlightDetailsProps {
  offer: FlightOffer;
}

export const FlightDetails: React.FC<FlightDetailsProps> = ({ offer }) => {
  // Safety checks
  if (!offer) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 p-6">
        <p className="text-slate-500 text-center">No details available</p>
      </div>
    );
  }

  const pricing = offer.pricing || {};
  const segments = offer.segments || [];
  const stops = offer.stops || { count: 0, details: [] };
  const baggage = offer.baggage || { checked: [], cabin: [] };
  const conditions = offer.conditions || { refundable: false, changeable: false, penalties: null };
  const cabin = offer.cabin || { class: 'Economy' };
  const refundPenalty = (conditions as typeof conditions & {
    refund_before_departure?: { penalty_amount?: number; penalty_currency?: string | null } | null;
  }).refund_before_departure;

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-6">
      {/* Price Breakdown */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-3">Price Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Base Fare</span>
            <span className="font-medium">
              {formatCurrency(pricing.base_fare || pricing.base_amount || 0, pricing.currency || 'USD')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Taxes & Fees</span>
            <span className="font-medium">
              {formatCurrency(pricing.tax_amount || 0, pricing.currency || 'USD')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Service Charge</span>
            <span className="font-medium">
              {formatCurrency(pricing.service_charge || offer.service_charge || 0, pricing.currency || 'USD')}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t">
            <span>Grand Total</span>
            <span className="text-primary text-lg">
              {formatCurrency(pricing.grand_total || offer.grand_total || 0, pricing.currency || 'USD')}
            </span>
          </div>
        </div>
      </div>

      {/* Journey Segments */}
      {segments.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Journey Details
          </h4>
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <SegmentCard key={segment?.id || index} segment={segment} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Return Journey */}
      {offer.return_slice?.segments && offer.return_slice.segments.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plane className="h-4 w-4 rotate-180" />
            Return Journey
          </h4>
          <div className="space-y-3">
            {offer.return_slice.segments.map((segment, index) => (
              <SegmentCard key={segment?.id || `return-${index}`} segment={segment} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Layovers */}
      {stops.details && stops.details.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Coffee className="h-4 w-4 text-amber-600" />
            Layover Information ({stops.details.length})
          </h4>
          <div className="space-y-3">
            {stops.details.map((layover, index) => (
              <div key={index} className="flex items-start gap-3 ml-2">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-0.5 h-full bg-amber-200 my-1"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {layover?.airport_name || layover?.airport || 'Unknown Airport'}
                    {layover?.airport && <span className="text-slate-500 ml-1">({layover.airport})</span>}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    Layover: {layover?.duration || 'N/A'}
                  </p>
                  {layover?.city && (
                    <p className="text-xs text-slate-500 mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {layover.city}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Baggage Details */}
      {(baggage.checked?.length > 0 || baggage.cabin?.length > 0) && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Luggage className="h-4 w-4" />
            Baggage Allowance
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {baggage.checked?.filter(b => b).map((bag, index) => (
              <div key={`checked-${index}`} className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-sm font-medium text-slate-900">Checked Baggage</p>
                <p className="text-xs text-slate-600 mt-1">
                  {bag?.quantity || 1} piece{bag?.quantity > 1 ? 's' : ''}
                  {bag?.type && ` (${bag.type})`}
                </p>
              </div>
            ))}
            {baggage.cabin && Array.isArray(baggage.cabin) && baggage.cabin.filter(b => b).map((bag, index) => (
              <div key={`cabin-${index}`} className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-sm font-medium text-slate-900">Cabin Baggage</p>
                <p className="text-xs text-slate-600 mt-1">
                  {bag?.quantity || 1} piece{bag?.quantity > 1 ? 's' : ''}
                  {bag?.type && ` (${bag.type})`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fare Conditions */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Fare Conditions
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className={`w-3 h-3 rounded-full ${conditions.refundable ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <span className="font-medium text-slate-700">
                {conditions.refundable ? 'Refundable' : 'Non-refundable'}
              </span>
              {!conditions.refundable && (
                <p className="text-xs text-slate-500 mt-0.5">
                  This fare cannot be refunded after purchase
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className={`w-3 h-3 rounded-full ${conditions.changeable ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <span className="font-medium text-slate-700">
                {conditions.changeable ? 'Changeable' : 'Non-changeable'}
              </span>
              {!conditions.changeable && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes to this booking are not permitted
                </p>
              )}
            </div>
          </div>
          
          {/* Penalty information if available */}
          {conditions.refundable && refundPenalty?.penalty_amount && (
            <div className="ml-6 p-2 bg-slate-50 rounded text-xs text-slate-600">
              <p>Cancellation penalty: {formatCurrency(refundPenalty.penalty_amount, refundPenalty.penalty_currency || 'USD')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      {offer.total_emissions_kg && (
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Environmental Impact
          </h4>
          <p className="text-sm text-slate-600">
            Estimated CO₂ emissions: <span className="font-medium">{offer.total_emissions_kg} kg</span>
          </p>
        </div>
      )}
    </div>
  );
};

// Segment Card Component with null safety
const SegmentCard: React.FC<{ segment: SegmentInfo; index: number }> = ({ segment, index }) => {
  // Return nothing if segment is invalid
  if (!segment) {
    return null;
  }

  const origin = segment.origin || {};
  const destination = segment.destination || {};
  const baggage = segment.baggage || { checked: 0, type: '' };

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      {/* Airline & Flight Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">
              {segment.airline_name || 'Unknown Airline'}
            </p>
            <p className="text-xs text-slate-500">
              Flight {segment.flight_number || 'N/A'}
              {segment.aircraft && ` • ${segment.aircraft}`}
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {formatDuration(segment.duration || '')}
        </span>
      </div>

      {/* Route Visualization */}
      <div className="flex items-center justify-between ml-11">
        {/* Departure */}
        <div>
          <p className="text-lg font-bold text-slate-900">
            {formatTime(segment.departure_time || '')}
          </p>
          <p className="text-sm text-slate-600">
            {origin.iata || '???'}
            {origin.terminal && ` • T${origin.terminal}`}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-[120px]">
            {origin.city || origin.airport || ''}
          </p>
        </div>

        {/* Flight Path */}
        <div className="flex-1 mx-4">
          <div className="relative">
            <div className="border-t-2 border-dashed border-slate-300"></div>
            <Plane className="absolute top-1/2 right-0 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
          </div>
        </div>

        {/* Arrival */}
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">
            {formatTime(segment.arrival_time || '')}
          </p>
          <p className="text-sm text-slate-600">
            {destination.iata || '???'}
            {destination.terminal && ` • T${destination.terminal}`}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-[120px]">
            {destination.city || destination.airport || ''}
          </p>
        </div>
      </div>

      {/* Segment Details Footer */}
      <div className="mt-3 ml-11 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {segment.cabin_class && (
          <span className="bg-slate-100 px-2 py-1 rounded">
            Cabin: {segment.cabin_class}
          </span>
        )}
        
        {/* Checked Baggage */}
        {baggage.checked && Array.isArray(baggage.checked) && baggage.checked.length > 0 && baggage.checked[0] && (
          <span className="bg-slate-100 px-2 py-1 rounded">
            Checked: {baggage.checked[0].quantity || 1}x
          </span>
        )}
        
        {/* Cabin Baggage */}
        {baggage.cabin && baggage.cabin > 0 && (
          <span className="bg-slate-100 px-2 py-1 rounded">
            Cabin: {baggage.cabin}x
          </span>
        )}
        
        {segment.distance != null && segment.distance !== '' && (
          <span className="bg-slate-100 px-2 py-1 rounded">
            {Math.round(Number(segment.distance))} km
          </span>
        )}
      </div>
    </div>
  );
};