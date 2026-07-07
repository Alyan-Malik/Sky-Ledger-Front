// src/components/flight-search/AirportSearchInput.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Airport } from '../../types/airport';
import { useAirportSearch } from '../../hooks/useAirportSearch';
import { cn } from '../../lib/utils';

interface AirportSearchInputProps {
  label: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AirportSearchInput: React.FC<AirportSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search airports...',
  error,
  disabled = false,
  icon,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { airports, loading, searchAirports, clearAirports } = useAirportSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setSelectedIndex(-1);

      if (newQuery.trim().length === 0) {
        onChange(null);
        setIsOpen(false);
        clearAirports();
        return;
      }

      if (value) {
        onChange(null);
      }

      if (newQuery.length >= 2) {
        setIsOpen(true);
        searchAirports(newQuery);
      } else {
        setIsOpen(false);
        clearAirports();
      }
    },
    [searchAirports, clearAirports, onChange, value]
  );

  const handleSelectAirport = useCallback(
    (airport: Airport) => {
      onChange(airport);
      setQuery(`${airport.city} (${airport.iata})`);
      setIsOpen(false);
      clearAirports();
    },
    [onChange, clearAirports]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || airports.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < airports.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && airports[selectedIndex]) {
          handleSelectAirport(airports[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const displayValue = query || (value ? `${value.city} (${value.iata})` : "");

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="space-y-2">
        <label className="text-slate-700 font-medium text-sm">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary">
              {icon}
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "h-12 w-full rounded-lg border bg-white px-4 text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              icon && "pl-10",
              error ? "border-red-500 focus:ring-red-200" : "border-slate-200"
            )}
            aria-label={label}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && airports.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1" role="listbox">
            {airports.map((airport, index) => (
              <li
                key={airport.iata}
                onClick={() => handleSelectAirport(airport)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                  "hover:bg-slate-50",
                  index === selectedIndex && "bg-primary/5"
                )}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {airport.airport_name}
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                    {airport.city}, {airport.country}
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {airport.iata}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results */}
      {isOpen && !loading && airports.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg p-4">
          <p className="text-sm text-slate-500 text-center">
            No airports found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};