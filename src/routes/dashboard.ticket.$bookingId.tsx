// src/routes/dashboard.ticket.$bookingId.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Printer, QrCode, Loader2, AlertTriangle,
  Plane, Clock, Luggage,
  Users, Shield, CreditCard,
  Phone, Mail, Ticket,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";
import { bookingService } from "@/services/booking-service";
import { formatTime, formatDuration, formatCurrency } from "@/lib/formatters";

export const Route = createFileRoute("/dashboard/ticket/$bookingId")({
  head: () => ({ meta: [{ title: "E-Ticket — SkyLedger" }] }),
  component: TicketPage,
});

// ============== BRAND TOKENS (Emirates-inspired) ==============
// Red:   #C8102E  — masthead / primary brand
// Gold:  #B8975A  — foil accents, dividers, premium labels
// Ink:   #1C1C1C  — primary text
// Slate: #5B6472  — secondary text
const BRAND = {
  red: "#C8102E",
  redDark: "#8C0C21",
  gold: "#B8975A",
  goldLight: "#E4D3AD",
  ink: "#1C1C1C",
};

function TicketPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getBooking(Number(bookingId));
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setError('Booking not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-slate-600">Loading ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{error || 'Booking Not Found'}</h3>
        <Button onClick={() => navigate({ to: '/dashboard/bookings' })}>Back to Bookings</Button>
      </div>
    );
  }

  const { passenger, flight, contact, additional_passengers, baggage, assistance, preferences } = booking;

  // All passengers including primary
  const allPassengers = [
    { ...passenger, type: 'primary_adult', passenger_type: 'adult' },
    ...(additional_passengers || []),
  ];

  const hasReturnFlight = flight?.return_flight && flight?.return_flight?.departure_time;
  const returnFlightData = flight?.return_flight;
  const airlineName = flight?.airline?.name || 'SkyLedger';
  const issueDate = new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <>
      {/* ============== PRINT STYLES ============== */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm 8mm; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .ticket-container {
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #d8d8d8 !important;
            margin: 0 !important;
          }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .segment-block { break-inside: avoid; page-break-inside: avoid; }
        }
        .watermark-pattern {
          background-image: repeating-linear-gradient(
            -35deg,
            rgba(184,151,90,0.05) 0px,
            rgba(184,151,90,0.05) 1px,
            transparent 1px,
            transparent 42px
          );
        }
        .perforation {
          background-image: radial-gradient(circle, #d1d5db 1.4px, transparent 1.6px);
          background-size: 10px 10px;
          background-position: center;
        }
      `}</style>

      {/* Dashboard chrome — hidden on print, this is app navigation, not part of the ticket itself */}
      <div className="no-print mb-6">
        <PageHeader
          title="E-Ticket / Itinerary"
          subtitle="Your electronic ticket and receipt"
          crumbs={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Bookings", to: "/dashboard/bookings" },
            { label: `Booking ${booking.booking_id}`, to: `/dashboard/bookings/${bookingId}` },
            { label: "E-Ticket" },
          ]}
          actions={
            <Button 
  onClick={() => window.print()} 
  size="lg" 
  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all"
>
  <Printer className="h-4 w-4 mr-2" /> Print Ticket
</Button>

          }
        />
      </div>

      {/* ============ TICKET CONTAINER ============ */}
      <div
        className="ticket-container watermark-pattern max-w-[900px] mx-auto bg-white text-[#1C1C1C] font-sans shadow-xl rounded-sm overflow-hidden"
        style={{ border: `1px solid ${BRAND.goldLight}` }}
      >

        {/* ────── MASTHEAD ────── */}
        <div style={{ background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)` }}>
          <div className="flex items-center justify-between px-7 pt-6 pb-5">
            {/* Airline identity */}
            <div className="flex items-center gap-4">
              {flight?.airline?.logo ? (
                <img
                  src={flight.airline.logo}
                  alt={airlineName}
                  className="h-14 w-14 object-contain rounded bg-white p-1.5 shadow-md"
                />
              ) : (
                <div className="h-14 w-14 bg-white rounded flex items-center justify-center shadow-md">
                  <Plane className="h-7 w-7" style={{ color: BRAND.red }} />
                </div>
              )}
              <div>
                <h1 className="text-[26px] leading-tight font-serif font-bold text-white tracking-wide">
                  {airlineName}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.2em] mt-0.5" style={{ color: BRAND.goldLight }}>
                  Electronic Ticket &amp; Passenger Itinerary Receipt
                </p>
              </div>
            </div>

            {/* Ticket number & barcode */}
            <div className="text-right">
              <p className="text-[10px] uppercase font-semibold tracking-widest" style={{ color: BRAND.goldLight }}>
                Ticket Number
              </p>
              <p className="text-lg font-mono font-bold text-white">
                {booking.eticket_number || booking.booking_id}
              </p>
              <div className="mt-1.5 h-9 w-60 ml-auto bg-[repeating-linear-gradient(90deg,#fff_0,#fff_2px,transparent_2px,transparent_4px)] rounded-sm opacity-90" />
              <p className="text-[8.5px] mt-1" style={{ color: BRAND.goldLight }}>
                Scan at self check-in or present ticket number
              </p>
            </div>
          </div>

          {/* Gold foil hairline */}
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.goldLight}, ${BRAND.gold})` }} />
        </div>

        {/* Legal notice strip */}
        <div className="px-7 py-3 text-[10.5px] text-gray-500 leading-relaxed bg-white border-b border-gray-100">
          <p>Your ticket is stored electronically in our reservation system. This receipt is your record of purchase and forms part of your conditions of carriage.</p>
          <p className="mt-0.5">You may be required to present this receipt at airport entry, at check-in, or to immigration as proof of onward or return travel.</p>
        </div>

        {/* ────── BOOKING REFERENCE STRIP ────── */}
        <div className="avoid-break px-7 py-4 flex items-center justify-between" style={{ background: '#FBF8F1', borderBottom: `1px solid ${BRAND.goldLight}` }}>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Booking Reference</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold tracking-widest" style={{ color: BRAND.red }}>{booking.booking_id}</span>
              <Badge className="text-[10px]" style={{ backgroundColor: BRAND.gold, color: '#fff' }}>CONFIRMED</Badge>
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-500">
            <p>Issued by: <span className="font-semibold text-gray-700">{airlineName}</span></p>
            <p>Issue date: <span className="font-semibold text-gray-700">{issueDate}</span></p>
          </div>
        </div>

        {/* ────── CHECK-IN TIMELINE ────── */}
        <div className="avoid-break px-7 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase mb-3 tracking-wider" style={{ color: BRAND.redDark }}>
            <Clock className="h-3.5 w-3.5" />
            Check-in Timeline
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="rounded-md p-3 border" style={{ borderColor: BRAND.goldLight, background: '#FBF8F1' }}>
              <p className="font-bold text-lg" style={{ color: BRAND.red }}>3–4 hrs</p>
              <p className="text-gray-600 mt-0.5">Arrive at the airport before departure</p>
            </div>
            <div className="rounded-md p-3 border" style={{ borderColor: BRAND.goldLight, background: '#FBF8F1' }}>
              <p className="font-bold text-lg" style={{ color: BRAND.red }}>90 min</p>
              <p className="text-gray-600 mt-0.5">Before take-off, clear passport control</p>
            </div>
            <div className="rounded-md p-3 border" style={{ borderColor: BRAND.goldLight, background: '#FBF8F1' }}>
              <p className="font-bold text-lg" style={{ color: BRAND.red }}>60 min</p>
              <p className="text-gray-600 mt-0.5">Be ready at the gate for boarding</p>
            </div>
          </div>
        </div>

        {/* ────── FLIGHT ITINERARY ────── */}
        <div className="border-b border-gray-100">
          <div className="px-7 py-2.5 flex items-center justify-between" style={{ background: BRAND.ink }}>
            <h2 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 text-white">
              <Plane className="h-4 w-4" style={{ color: BRAND.gold }} /> Flight Itinerary
            </h2>
            <p className="text-[9.5px] text-white/50">All times local to each city</p>
          </div>

          {flight && (
            <div className="segment-block p-6">
              <FlightSegmentCard
                label="Outbound"
                flightNumber={flight?.flight?.number}
                cabinClass={flight?.flight?.cabin_class}
                fareBrand={flight?.flight?.fare_brand}
                origin={flight?.route?.origin}
                destination={flight?.route?.destination}
                departureTime={flight?.schedule?.departure}
                arrivalTime={flight?.schedule?.arrival}
                duration={flight?.schedule?.duration}
                stops={flight?.schedule?.stops || 0}
                terminal={flight?.flight?.terminal}
                seatNumber={preferences?.seat_number}
                baggageCount={baggage?.checked_count || 0}
                status="Confirmed"
              />
            </div>
          )}

          {hasReturnFlight && returnFlightData && (
            <>
              <div className="perforation h-3 mx-6" />
              <div className="segment-block px-6 pb-6 pt-1 bg-[#FBFAF8]">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-widest">
                  Return Flight
                </div>
                <FlightSegmentCard
                  label="Return"
                  flightNumber={returnFlightData.flight_number || flight?.flight?.number}
                  cabinClass={flight?.flight?.cabin_class}
                  fareBrand={flight?.flight?.fare_brand}
                  origin={returnFlightData.origin}
                  destination={returnFlightData.destination}
                  departureTime={returnFlightData.departure_time}
                  arrivalTime={returnFlightData.arrival_time}
                  duration={returnFlightData.duration}
                  stops={returnFlightData.stops || 0}
                  terminal={flight?.flight?.terminal}
                  seatNumber={preferences?.seat_number}
                  baggageCount={baggage?.checked_count || 0}
                  status="Confirmed"
                  isReturn
                />
              </div>
            </>
          )}
        </div>

        {/* ────── PASSENGER INFORMATION ────── */}
        <div className="border-b border-gray-100">
          <div className="px-7 py-2.5" style={{ backgroundColor: BRAND.red }}>
            <h2 className="text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 text-white">
              <Users className="h-4 w-4" /> Passenger Information ({allPassengers.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {allPassengers.map((pax, index) => (
              <div key={index} className="avoid-break px-7 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                    style={
                      index === 0
                        ? { backgroundColor: BRAND.red, color: '#fff', borderColor: BRAND.red }
                        : pax.passenger_type === 'infant'
                          ? { backgroundColor: '#FCE7F3', color: '#BE185D', borderColor: '#F9A8D4' }
                          : pax.passenger_type === 'child'
                            ? { backgroundColor: '#EDE9FE', color: '#6D28D9', borderColor: '#C4B5FD' }
                            : { backgroundColor: '#F3F4F6', color: '#4B5563', borderColor: '#D1D5DB' }
                    }
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {pax.first_name} {pax.last_name}
                      {index === 0 && (
                        <Badge className="ml-2 text-[10px]" style={{ backgroundColor: BRAND.goldLight, color: BRAND.redDark }}>
                          Primary
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="capitalize">{pax.passenger_type || 'Adult'}</span>
                      {pax.gender && <span>• {pax.gender}</span>}
                      {pax.nationality && <span>• {pax.nationality}</span>}
                      {pax.passport_number && (
                        <span className="font-mono">• Passport: {pax.passport_number}</span>
                      )}
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className="text-right text-xs text-gray-500">
                    <p className="flex items-center gap-1 justify-end"><Mail className="h-3 w-3" /> {contact?.email}</p>
                    <p className="flex items-center gap-1 mt-0.5 justify-end"><Phone className="h-3 w-3" /> {contact?.phone}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ────── BAGGAGE, PREFERENCES & FARE ────── */}
        <div className="avoid-break grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {/* Baggage */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <Luggage className="h-3.5 w-3.5" style={{ color: BRAND.gold }} /> Baggage
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Checked:</span>
                <span className="font-semibold">{baggage?.checked_count || 0} pc(s) • 23kg each</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hand Luggage:</span>
                <span className="font-semibold">{baggage?.hand_luggage_count || 0} pc(s) • 7kg each</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                Max dimensions: 55 × 38 × 22cm for hand luggage. Individual checked items over 32kg cannot be accepted.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <Shield className="h-3.5 w-3.5" style={{ color: BRAND.gold }} /> Preferences
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Seat:</span>
                <span className="font-semibold">{preferences?.seat_number || 'TBA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Meal:</span>
                <span className="font-semibold capitalize">
                  {preferences?.meal_preference ? preferences.meal_preference.replace(/_/g, ' ') : 'Regular'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wheelchair:</span>
                <span className="font-semibold capitalize">
                  {assistance?.wheelchair === 'none' ? 'Not Required' : assistance?.wheelchair?.replace(/_/g, ' ') || 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Priority Pass:</span>
                {assistance?.priority_pass ? (
                  <Badge className="text-[10px]" style={{ backgroundColor: BRAND.gold, color: '#fff' }}>Enabled</Badge>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <CreditCard className="h-3.5 w-3.5" style={{ color: BRAND.gold }} /> Fare
            </h3>
            {flight?.pricing && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Fare:</span>
                  <span>{formatCurrency(parseFloat(flight.pricing.base_price), flight.pricing.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Charge:</span>
                  <span>{formatCurrency(parseFloat(flight.pricing.service_charge), flight.pricing.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span style={{ color: BRAND.red }}>{formatCurrency(parseFloat(flight.pricing.total_price), flight.pricing.currency)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ────── IMPORTANT INFORMATION ────── */}
        <div className="avoid-break border-b border-gray-100 px-7 py-5" style={{ background: '#FBF8F1' }}>
          <div className="grid grid-cols-[1fr_auto] gap-6">
            <div>
              <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 tracking-wide">Important Information</h3>
              <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Please arrive at the airport 3 hours before departure. At most airports check-in closes 60 minutes before departure.</li>
                <li>Valid photo ID (passport/national ID) required for all passengers. Check visa requirements for your destination.</li>
                <li>Check with your departure airport for restrictions on liquids, aerosols and gels in hand baggage.</li>
                <li>Dangerous goods such as explosives, compressed gases, flammable liquids, oxidizing materials, and lithium batteries are forbidden.</li>
                <li>The UAE has a strict zero-tolerance anti-drugs policy. Possession of illegal drugs will be subject to punishment.</li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="border-2 p-3 rounded-xl bg-white" style={{ borderColor: BRAND.goldLight }}>
                <QrCode className="h-20 w-20" style={{ color: BRAND.ink }} />
              </div>
              <p className="text-[9px] text-gray-400 text-center">Scan for digital boarding pass</p>
            </div>
          </div>
        </div>

        {/* ────── FOOTER MASTHEAD ────── */}
        <div className="px-7 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.redDark} 100%)` }}>
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5" style={{ color: BRAND.gold }} />
            <div>
              <p className="font-bold text-sm text-white">{airlineName}</p>
              <p className="text-[10px] text-white/70">Thank you for choosing us</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-white/70">
            <p>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
            <p>{airlineName} © {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============== FLIGHT SEGMENT CARD COMPONENT ==============
function FlightSegmentCard({
  label,
  flightNumber,
  cabinClass,
  fareBrand,
  origin,
  destination,
  departureTime,
  arrivalTime,
  duration,
  stops,
  terminal,
  seatNumber,
  baggageCount,
  status,
  isReturn = false,
}: {
  label: string;
  flightNumber?: string;
  cabinClass?: string;
  fareBrand?: string;
  origin?: { iata: string; city: string; airport?: string };
  destination?: { iata: string; city: string; airport?: string };
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  stops?: number;
  terminal?: string;
  seatNumber?: string;
  baggageCount?: number;
  status?: string;
  isReturn?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: isReturn ? '#D1D5DB' : BRAND.goldLight }}>
      {/* Flight Header Bar */}
      <div
        className="flex items-center justify-between px-5 py-2 text-xs font-bold text-white uppercase tracking-wide"
        style={{ background: isReturn ? '#4B5563' : BRAND.red }}
      >
        <div className="flex items-center gap-3">
          <span>{label}</span>
          <span className="text-white/60">|</span>
          <span>{cabinClass || 'Economy'}</span>
          {fareBrand && <span className="text-white/60">• {fareBrand}</span>}
        </div>
        <span className="text-base tracking-wider font-mono">{flightNumber || 'N/A'}</span>
      </div>

      {/* Route & Times */}
      <div className="p-5 bg-white">
        <div className="flex items-center justify-between">
          {/* Departure */}
          <div className="flex-1">
            <p className="text-3xl font-black text-gray-900">{origin?.iata || '???'}</p>
            <p className="text-sm text-gray-600 mt-0.5">{origin?.city || ''}</p>
            {origin?.airport && (
              <p className="text-xs text-gray-400 mt-0.5">{origin.airport}</p>
            )}
            {terminal && <p className="text-xs text-gray-400 mt-0.5">Terminal {terminal}</p>}
            <div className="mt-3">
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Departure</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(departureTime || '')}</p>
              <p className="text-xs text-gray-500">
                {departureTime ? new Date(departureTime).toLocaleDateString('en-US', {
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                }) : ''}
              </p>
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 flex flex-col items-center px-6">
            <div className="text-sm text-gray-500 font-medium mb-2">
              {formatDuration(duration || '')}
            </div>
            <div className="relative w-full">
              <div className="border-t-2 border-dashed" style={{ borderColor: BRAND.goldLight }}></div>
              <Plane
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 bg-white p-0.5 rounded-full"
                style={{ color: isReturn ? '#6B7280' : BRAND.red, transform: isReturn ? 'translate(-50%, -50%) rotate(180deg)' : 'translate(-50%, -50%)' }}
              />
            </div>
            <Badge
              className="mt-2 text-[10px]"
              style={
                (stops || 0) === 0
                  ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                  : { backgroundColor: '#FEF3C7', color: '#92400E' }
              }
            >
              {(stops || 0) === 0 ? 'Non-stop' : `${stops} Stop(s)`}
            </Badge>
          </div>

          {/* Arrival */}
          <div className="flex-1 text-right">
            <p className="text-3xl font-black text-gray-900">{destination?.iata || '???'}</p>
            <p className="text-sm text-gray-600 mt-0.5">{destination?.city || ''}</p>
            {destination?.airport && (
              <p className="text-xs text-gray-400 mt-0.5">{destination.airport}</p>
            )}
            <div className="mt-3">
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Arrival</p>
              <p className="text-xl font-bold text-gray-900">{formatTime(arrivalTime || '')}</p>
              <p className="text-xs text-gray-500">
                {arrivalTime ? new Date(arrivalTime).toLocaleDateString('en-US', {
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                }) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-4 gap-3 text-center text-xs">
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Seat</p>
            <p className="font-bold text-gray-800 mt-0.5">{seatNumber || 'TBA'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Status</p>
            <p className="font-bold mt-0.5" style={{ color: '#15803D' }}>{status || 'Confirmed'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Baggage</p>
            <p className="font-bold text-gray-800 mt-0.5">{baggageCount || 0} kg</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase">Cabin</p>
            <p className="font-bold text-gray-800 mt-0.5">{cabinClass || 'Economy'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}