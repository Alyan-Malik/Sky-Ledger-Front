// src/routes/dashboard.search.tsx (updated version)

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  ArrowLeftRight,
  CalendarIcon,
  ChevronDown,
  PlaneLanding,
  PlaneTakeoff,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AirportSearchInput } from "@/components/flight-search/AirportSearchInput";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useFlightResults } from "@/hooks/useFlightResults";
import { useSearchState } from "@/hooks/useSearchState";
import { flightOffersService } from "@/services/flight-offers-service";
import { Airport } from "@/types/airport";
import { TripType, CabinClass, FlightSearchFormData } from "@/types/flight-search";
import { toast } from "sonner";
export const Route = createFileRoute("/dashboard/search")({
  head: () => ({ meta: [{ title: "Search Flights — SkyLedger" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  // const { toast } = useToast();
  
  // Form State
  const [trip, setTrip] = useState<TripType>("round_trip");
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [depart, setDepart] = useState<Date | undefined>(new Date());
  const [ret, setRet] = useState<Date | undefined>();
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [infants, setInfants] = useState("0");
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const passengerSummary = `Adults ${adults} • Children ${children} • Infants ${infants}`;

  // Hooks
  const { loading: savingSearch, errors: searchErrors, saveSearch } = useFlightSearch();
  const { searchFlights, loading: searchingFlights } = useFlightResults();

  const isLoading = savingSearch || searchingFlights;

  const updatePassengerCount = (type: "adults" | "children" | "infants", delta: number) => {
    const currentValue = Number(type === "adults" ? adults : type === "children" ? children : infants);
    const minimum = type === "adults" ? 1 : 0;
    const nextValue = Math.max(minimum, currentValue + delta);

    if (type === "adults") {
      setAdults(String(nextValue));
    } else if (type === "children") {
      setChildren(String(nextValue));
    } else {
      setInfants(String(nextValue));
    }
  };

  const swap = useCallback(() => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
  }, [origin, destination]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!origin) {
      errors.origin = 'Please select a departure airport';
    }
    if (!destination) {
      errors.destination = 'Please select an arrival airport';
    }
    if (origin && destination && origin.iata === destination.iata) {
      errors.destination = 'Origin and destination must be different';
    }
    if (!depart) {
      errors.departure = 'Please select a departure date';
    }
    if (trip === 'round_trip' && !ret) {
      errors.return_date = 'Please select a return date';
    }
    if (ret && depart && ret < depart) {
      errors.return_date = 'Return date must be after departure date';
    }
    if (parseInt(infants) > parseInt(adults)) {
      errors.infants = 'Infants cannot exceed number of adults';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

 // In dashboard.search.tsx, update handleSubmit:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm() || !origin || !destination) {
        toast.error("Validation Error", {
      description: "Please fix the errors before searching.",
    });

    return;
  }

  const searchData: FlightSearchFormData = {
    trip_type: trip,
    origin_iata: origin.iata,
    destination_iata: destination.iata,
    departure_date: depart ? format(depart, "yyyy-MM-dd") : "",
    return_date: trip === "round_trip" && ret ? format(ret, "yyyy-MM-dd") : null,
    adults: parseInt(adults),
    children: parseInt(children),
    infants: parseInt(infants),
    cabin_class: cabinClass,
  };

  try {
    // Clear previous search state
    useSearchState.getState().clearSearch();
    
    // Set search data and loading state
    useSearchState.getState().setSearchData(searchData);
    useSearchState.getState().setLoading(true);
    
    // Navigate to results page immediately to show skeleton
    navigate({ 
      to: "/dashboard/results",
      search: { searchId: 0 } // Will be updated later
    });
    
    // Call the flight offers search
    const flightResponse = await flightOffersService.searchFlights(searchData);
    
    console.log('Flight response:', flightResponse);

    if (flightResponse.success) {
      const foundOffers = flightResponse.data?.offers || [];
      const newSearchId = flightResponse.data?.search?.id || 0;
      
      if (foundOffers.length > 0) {
        // Store results in state management
        useSearchState.getState().setSearchResults(foundOffers, newSearchId);
        
        // Update the URL with the correct searchId
        navigate({ 
          to: "/dashboard/results",
          search: { searchId: newSearchId },
          replace: true
        });
        
               toast.success("Flights Found!", {
          description: `${foundOffers.length} flights found.`,
        });

      } else {
        useSearchState.getState().setError('No flights found for the selected criteria.');
      }
    } else {
      useSearchState.getState().setError(
        flightResponse.message || 'No flights found for your search.'
      );
    }
  } catch (err: any) {
    console.error('Search error:', err);
    
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        "Failed to search flights.";
    
    useSearchState.getState().setError(errorMessage);
    
       toast.error("Search Failed", {
      description: errorMessage,
    });

  }
};

  return (
    <>
      <PageHeader
        title="Search Flights"
        subtitle="Find the best fares across airlines in seconds."
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Search Flights" }]}
      />

      {/* Main Container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 sm:p-8">
        {/* Background SVG */}
        <div className="pointer-events-none absolute -bottom-14 -right-20 z-0 select-none text-slate-100 opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="500"
            height="400"
            viewBox="0 0 28 25"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rotate-[25deg]"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.8.3-2 1.2-.2.9.3 1.8 1.2 2l8 1.8-3.5 3.5-4.1-.5c-.5-.1-1 .1-1.3.5-.4.4-.4 1 0 1.4l1.9 1.9 1.9 1.9c.4.4 1 .4 1.4 0 .4-.3.6-.8.5-1.3l-.5-4.1 3.5-3.5 1.8 8c.2.9 1.1 1.4 2 1.2.9-.2 1.4-1.1 1.2-2Z" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Trip Type Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTrip("round_trip")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                trip === "round_trip"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Round Trip
            </button>
            <button
              type="button"
              onClick={() => setTrip("one_way")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                trip === "one_way"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              One Way
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Origin & Destination */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="relative grid gap-4 sm:grid-cols-2">
  <AirportSearchInput
    //  The key prop forces React to completely redraw with the swapped DB data
    key={`origin-${origin?.id || origin?.iata || 'empty'}`}
    label="From"
    value={origin}
    onChange={(airport) => {
      setOrigin(airport);
      delete validationErrors.origin;
    }}
    placeholder="Departure airport..."
    error={validationErrors.origin || searchErrors.origin_iata?.[0]}
    icon={<PlaneTakeoff className="h-4 w-4" />}
  />

  <AirportSearchInput
    // The key prop forces React to completely redraw with the swapped DB data
    key={`dest-${destination?.id || destination?.iata || 'empty'}`}
    label="To"
    value={destination}
    onChange={(airport) => {
      setDestination(airport);
      delete validationErrors.destination;
    }}
    placeholder="Arrival airport..."
    error={validationErrors.destination || searchErrors.destination_iata?.[0]}
    icon={<PlaneLanding className="h-4 w-4" />}
  />

  <button
    type="button"
    onClick={swap}
    className="absolute left-1/2 -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-primary shadow-md transition-all hover:rotate-180 active:scale-95 z-20 top-[4.2rem] sm:top-[2.35rem]"
    aria-label="Swap origin and destination"
  >
    <ArrowLeftRight className="h-4 w-4 rotate-90 sm:rotate-0" />
  </button>
</div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Departure</Label>
                  <DateField 
                    date={depart} 
                    setDate={(date) => {
                      setDepart(date);
                      delete validationErrors.departure;
                    }} 
                    placeholder="Select date" 
                  />
                  {validationErrors.departure && (
                    <p className="text-sm text-red-500">{validationErrors.departure}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Return</Label>
                  <DateField
                    date={ret}
                    setDate={(date) => {
                      setRet(date);
                      delete validationErrors.return_date;
                    }}
                    placeholder={trip === "one_way" ? "One way" : "Select date"}
                    disabled={trip === "one_way"}
                    minDate={depart}
                  />
                  {validationErrors.return_date && (
                    <p className="text-sm text-red-500">{validationErrors.return_date}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Passenger Info & Cabin */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                <Label className="text-slate-700 font-medium">Passengers</Label>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPassengersOpen((open) => !open)}
                    className="flex w-full items-center justify-between px-3 py-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">Passengers</p>
                      <p className="text-xs text-slate-500">{passengerSummary}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", passengersOpen && "rotate-180")} />
                    </div>
                  </button>

                  {passengersOpen && (
                    <div className="border-t border-slate-200 bg-slate-50 p-3">
                      <div className="space-y-3">
                        {[
                          { key: "adults" as const, label: "Adults", value: adults },
                          { key: "children" as const, label: "Children", value: children },
                          { key: "infants" as const, label: "Infants", value: infants },
                        ].map((passenger) => (
                          <div key={passenger.key} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm">
                            <div>
                              <p className="text-sm font-medium text-slate-700">{passenger.label}</p>
                              <p className="text-xs text-slate-500">
                                {passenger.key === "adults"
                                  ? "Traveling adults"
                                  : passenger.key === "children"
                                    ? "Ages 2-11"
                                    : "Under 2"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updatePassengerCount(passenger.key, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary"
                                aria-label={`Decrease ${passenger.label}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-8 text-center text-sm font-semibold text-slate-800">
                                {passenger.value}
                              </span>
                              <button
                                type="button"
                                onClick={() => updatePassengerCount(passenger.key, 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary"
                                aria-label={`Increase ${passenger.label}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {searchErrors.adults?.[0] && (
                  <p className="text-sm text-red-500">{searchErrors.adults[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Cabin Class</Label>
                <Select 
                  value={cabinClass} 
                  onValueChange={(value) => setCabinClass(value as CabinClass)}
                >
                  <SelectTrigger className="h-12 border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium_economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hidden fields */}
              <input type="hidden" value={children} />
              <input type="hidden" value={infants} />

              {/* Search Button */}
              <div className="flex items-end sm:col-span-2 lg:col-span-2">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading}
                  className="h-12 w-full font-semibold shadow-md transition-all hover:brightness-105 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Search Flights
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="mt-8">
  <h2 className="text-sm font-semibold text-slate-700">Popular routes from Karachi</h2>
  <div className="mt-3 flex flex-wrap gap-2">
    {popularRoutes.map((route, index) => (
      <button
        key={route.iata}
        type="button"
        onClick={() => {
          // 1. Force combine the missing ID and rename airport_name to name
          const mappedAirport = {
            ...route,
            id: index + 9999, // Fills the missing required 'id' property
            name: route.airport_name, // Map it in case your Airport type expects 'name'
          };

          // 2. Double-cast to break the readonly literal restriction
          setDestination(mappedAirport as unknown as Airport);

          // 3. Clear errors safely
          if (validationErrors.destination) {
            const updatedErrors = { ...validationErrors };
            delete updatedErrors.destination;
            setValidationErrors(updatedErrors);
          }
        }}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition-all hover:border-primary hover:text-primary hover:shadow-sm"
      >
        Karachi → {route.city} ({route.iata})
      </button>
    ))}
  </div>
</div>
    </>
  );
}

// Date Field Component
function DateField({
  date,
  setDate,
  placeholder,
  disabled,
  minDate,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  placeholder: string;
  disabled?: boolean;
  minDate?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-12 w-full justify-start text-left font-normal border-slate-200 bg-white gap-2",
            !date && "text-slate-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate">
            {date ? format(date, "EEE, dd MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const min = minDate || today;
            return date < min;
          }}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

// Popular Routes Data
const popularRoutes = [
  { city: "Dubai", iata: "DXB", airport_name: "Dubai International Airport", country: "UAE", full_name: "Dubai International Airport (DXB)", location: "Dubai, UAE" },
  { city: "London", iata: "LHR", airport_name: "London Heathrow Airport", country: "UK", full_name: "London Heathrow Airport (LHR)", location: "London, UK" },
  { city: "New York", iata: "JFK", airport_name: "John F Kennedy International Airport", country: "USA", full_name: "John F Kennedy International Airport (JFK)", location: "New York, USA" },
  { city: "Istanbul", iata: "IST", airport_name: "Istanbul Airport", country: "Turkey", full_name: "Istanbul Airport (IST)", location: "Istanbul, Turkey" },
  { city: "Bangkok", iata: "BKK", airport_name: "Suvarnabhumi Airport", country: "Thailand", full_name: "Suvarnabhumi Airport (BKK)", location: "Bangkok, Thailand" },
] as const;