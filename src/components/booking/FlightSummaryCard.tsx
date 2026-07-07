// src/components/booking/FlightSummaryCard.tsx

import React from 'react';
import { Plane, Clock, Luggage, MapPin, Shield, ChevronRight } from 'lucide-react';
import { SelectedFlight } from '../../types/selected-flight';
import { formatDuration, formatTime, formatCurrency } from '../../lib/formatters';
import { Badge } from '../ui/badge';

interface FlightSummaryCardProps {
  flight: SelectedFlight;
}

export const FlightSummaryCard: React.FC<FlightSummaryCardProps> = ({ flight }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          Flight Summary
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Airline & Price */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {flight.airline.logo ? (
              <img
                src={flight.airline.logo}
                alt={flight.airline.name}
                className="h-14 w-14 object-contain rounded-lg bg-slate-50 p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-14 w-14 bg-slate-100 rounded-lg flex items-center justify-center">
                <Plane className="h-7 w-7 text-slate-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                {flight.airline.name}
              </h3>
              <p className="text-sm text-slate-500">
                Flight {flight.flight.number} • {flight.flight.cabin_class}
              </p>
              {flight.flight.aircraft && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Aircraft: {flight.flight.aircraft}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(parseFloat(flight.pricing.total_price), flight.pricing.currency)}
            </p>
            <p className="text-xs text-slate-500">Total price incl. taxes & fees</p>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-6">
          {/* Departure */}
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {formatTime(flight.schedule.departure)}
            </p>
            <p className="text-lg font-semibold text-slate-700 mt-2">
              {flight.route.origin.iata}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {flight.route.origin.city}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {flight.route.origin.airport}
            </p>
            {flight.flight.terminal && (
              <Badge variant="outline" className="mt-2 text-xs">
                Terminal {flight.flight.terminal}
              </Badge>
            )}
          </div>

          {/* Flight Path */}
          <div className="flex-1 flex flex-col items-center px-6">
            <div className="text-sm text-slate-500 font-medium mb-2">
              {formatDuration(flight.schedule.duration)}
            </div>
            <div className="relative w-full">
              <div className="border-t-2 border-slate-300 w-full"></div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow"></div>
              <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary bg-white p-0.5 rounded-full" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow"></div>
            </div>
            <Badge 
              variant={flight.schedule.stops === 0 ? 'secondary' : 'outline'} 
              className="mt-2 text-xs"
            >
              {flight.schedule.stops === 0 ? 'Direct Flight' : `${flight.schedule.stops} Stop(s)`}
            </Badge>
          </div>

          {/* Arrival */}
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {formatTime(flight.schedule.arrival)}
            </p>
            <p className="text-lg font-semibold text-slate-700 mt-2">
              {flight.route.destination.iata}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {flight.route.destination.city}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {flight.route.destination.airport}
            </p>
          </div>
        </div>

        {/* Flight Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem icon={<Clock className="h-4 w-4" />} label="Duration" value={formatDuration(flight.schedule.duration)} />
          <DetailItem icon={<Plane className="h-4 w-4" />} label="Cabin Class" value={flight.flight.cabin_class} />
          <DetailItem icon={<Luggage className="h-4 w-4" />} label="Baggage" value="Included" />
          <DetailItem icon={<Shield className="h-4 w-4" />} label="Status" value="Confirmed" />
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-50 rounded-lg p-4">
  <h4 className="font-semibold text-slate-900 mb-3">Price Details</h4>
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-slate-600">Base Fare</span>
      <span className="font-medium">
        {formatCurrency(parseFloat(flight.pricing.base_price), flight.pricing.currency)}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">Service Charge</span>
      <span className="font-medium">
        {formatCurrency(parseFloat(flight.pricing.service_charge), flight.pricing.currency)}
      </span>
    </div>
    <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t">
      <span>Grand Total</span>
      <span className="text-primary text-lg">
        {formatCurrency(parseFloat(flight.pricing.total_price), flight.pricing.currency)}
      </span>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);