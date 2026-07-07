// src/components/flight-results/FlightCardSkeleton.tsx

import React from 'react';

export const FlightCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 w-24 bg-slate-200 rounded ml-auto" />
          <div className="h-3 w-32 bg-slate-200 rounded ml-auto" />
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between py-6 border-t border-slate-100">
        <div className="flex-1 space-y-2">
          <div className="h-8 w-20 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-12 bg-slate-200 rounded mx-auto" />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="relative w-full h-[2px] my-2">
            <div className="absolute inset-0 bg-slate-200" />
          </div>
          <div className="h-5 w-16 bg-slate-200 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-8 w-20 bg-slate-200 rounded mx-auto" />
          <div className="h-4 w-12 bg-slate-200 rounded mx-auto" />
        </div>
      </div>

      {/* Features */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="h-10 flex-1 bg-slate-200 rounded-lg" />
        <div className="h-10 flex-1 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
};

export const FlightResultsSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};