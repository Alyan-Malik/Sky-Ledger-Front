// src/routes/dashboard.ticket.$bookingId.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Printer, Loader2, AlertTriangle, Plane,
  Users, Luggage, Shield, CreditCard,
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

// ============== UNIVERSAL E-TICKET STYLES ==============
// Neutral, airline-agnostic palette matching IATA standard receipts
const STYLES = {
  sectionHeaderBg: "#6B7280",      // Slate gray section headers
  sectionHeaderText: "#FFFFFF",
  borderColor: "#9CA3AF",
  textPrimary: "#1F2937",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  bgLight: "#F9FAFB",
  fontMono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
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
  const airlineCode = flight?.airline?.iata_code || flight?.flight?.number?.substring(0, 2) || 'XX';
  
  const issueDate = booking.created_at 
    ? new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : 'N/A';
  
  const ticketNumber = booking.eticket_number || `${airlineCode}${booking.booking_id}`;
  const pnrReference = booking.pnr_number || booking.booking_id;

  // Format date for flight segments (DD MMM YY)
  const formatFlightDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  // Format time (HHMM)
  const formatFlightTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '');
  };

  // Check-in opens (3 hours before departure)
  const getCheckInOpens = (dateStr?: string) => {
    if (!dateStr) return { date: '', time: '' };
    const d = new Date(dateStr);
    d.setHours(d.getHours() - 3);
    return {
      date: formatFlightDate(d.toISOString()),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '')
    };
  };

  // Coupon validity (1 year from departure)
  const getCouponValidity = (dateStr?: string) => {
    if (!dateStr) return { notBefore: '', notAfter: '' };
    const notBefore = formatFlightDate(dateStr);
    const d = new Date(dateStr);
    d.setFullYear(d.getFullYear() + 1);
    return {
      notBefore,
      notAfter: formatFlightDate(d.toISOString())
    };
  };

  return (
    <>
      {/* ============== PRINT STYLES ============== */}
      <style>{`
        @media print {
          @page { 
            size: A4; 
            margin: 10mm 8mm;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            font-size: 9pt;
          }
          
          header, .app-header, .navbar, .no-print { 
            display: none !important; 
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .ticket-document {
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
            margin: 0 !important;
          }
          
          .avoid-break { 
            break-inside: avoid; 
            page-break-inside: avoid; 
          }
          
          .segment-block { 
            break-inside: avoid; 
            page-break-inside: avoid; 
          }
        }
      `}</style>

      {/* Dashboard chrome — hidden on print */}
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

      {/* ============ TICKET DOCUMENT ============ */}
      <div className="ticket-document max-w-[210mm] mx-auto bg-white text-[#1F2937] font-sans shadow-xl overflow-hidden border border-gray-300">
        
        {/* ────── HEADER: Airline Logo + Title ────── */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {flight?.airline?.logo ? (
              <img
                src={flight.airline.logo}
                alt={airlineName}
                className="h-14 w-14 object-contain rounded bg-white p-1 shadow-sm border border-gray-100"
              />
            ) : (
              <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                <Plane className="h-7 w-7 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: STYLES.textPrimary }}>
                {airlineName}
              </h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 mt-1">
                Electronic Ticket & Passenger Itinerary Receipt
              </p>
            </div>
          </div>
        </div>

        {/* ────── LEGAL NOTICE + TICKET NUMBER (Right side) ────── */}
        <div className="avoid-break px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Legal text */}
            <div className="text-[11px] text-gray-600 leading-relaxed flex-1">
              <p>
                Your electronic ticket is stored in our computer reservation system. This e-Ticket receipt / Itinerary is your record of your electronic ticket and forms part of your contract of carriage. You may need to show this receipt to enter the airport and/or to prove return or onward travel to customs and immigration officials.
              </p>
              <p className="mt-1">
                Your attention is drawn to the Conditions of Contract and Other Important Notices set out in the attached document. Please visit us on <span className="text-blue-600 underline">www.{airlineName.toLowerCase().replace(/\s+/g, '')}.com</span> to check-in online and for more information.
              </p>
            </div>
            
            {/* Right: Ticket Number & Barcode */}
          <div className="text-right border-l border-gray-200 pl-6 min-w-[200px] flex flex-col items-end justify-center print:border-l print:pl-6">
  <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-500">
    Ticket Number
  </p>
  <p className="text-xl font-mono font-extrabold text-gray-900 tracking-wider mt-0.5">
    {ticketNumber}
  </p>
  
  {/* 
    EXACT INDUSTRIAL BARCODE LAYOUT
    - Absolutely square corners (no border-radius / rounding).
    - Hard pixel-snapped gradient bands matching high-density commercial scanner layouts.
    - Forced print-color-adjust guarantees background lines look exactly identical on paper.
  */}
  <div 
    className="mt-2 h-10 w-48 ml-auto mr-0 opacity-100" 
    style={{
      backgroundImage: `
        repeating-linear-gradient(90deg, #000000 0px, #000000 2px, transparent 2px, transparent 5px),
        repeating-linear-gradient(90deg, #000000 0px, #000000 1px, transparent 1px, transparent 8px),
        repeating-linear-gradient(90deg, #000000 0px, #000000 3px, transparent 3px, transparent 13px)
      `,
      backgroundBlendMode: 'darken',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact'
    }}
  />
  
  <p className="text-[8.5px] font-sans font-medium text-gray-400 mt-1.5 uppercase tracking-wide">
    Scan at self check-in or present number
  </p>
</div>
          </div>
        </div>

        {/* ────── CHECK-IN INSTRUCTIONS ────── */}
        <div className="avoid-break px-6 py-3 text-[10px] text-gray-700 leading-relaxed border-b border-gray-200 bg-[#F9FAFB]">
          <p>
            <span className="font-bold">{flight?.flight?.cabin_class || 'Economy'} Class</span> passengers should report to {airlineName} check-in desks <span className="font-bold">3 hours</span> prior to departure of all flights. First and Business Class passengers should report to {airlineName} check-in desks not later than <span className="font-bold">1 hour</span> prior to departure. Boarding for your flight begins at least <span className="font-bold">35 minutes</span> before your scheduled departure time. Gates close <span className="font-bold">15 minutes</span> prior to departure.
          </p>
          <p className="mt-1.5">
            Please check with departure airport for restrictions on the carriage of liquids, aerosols and gels in hand baggage.
          </p>
        </div>

        {/* ────── BOOKING REFERENCE STRIP ────── */}
        <div className="avoid-break px-6 py-3 flex items-center justify-between bg-white border-b border-gray-200">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Booking Reference</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-md font-bold tracking-widest text-gray-900">{booking.booking_id}</span>
              <Badge className="text-[8px] bg-gray-600 text-white">CONFIRMED</Badge>
            </div>
          </div>
          <div className="text-right text-[11px] text-gray-500">
            <p>Issued by: <span className="font-semibold text-gray-900">{airlineName}</span></p>
            <p>Issue date: <span className="font-semibold text-gray-900">{issueDate}</span></p>
          </div>
        </div>

        {/* ────── PASSENGER AND TICKET INFORMATION ────── */}
        <div className="avoid-break">
          <div 
            className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: STYLES.sectionHeaderBg }}
          >
            Passenger and Ticket Information
          </div>
          
          <div className="px-6 py-3">
            <table className="w-full text-[10px]">
              <tbody>
                <tr>
                  <td className="w-1/4 py-1 font-bold text-gray-700 align-top">PASSENGER NAME</td>
                  <td className="w-1/4 py-1 font-mono font-bold text-gray-900 align-top uppercase">
                    {passenger?.last_name || ''}/{passenger?.first_name || ''}
                  </td>
                  <td className="w-1/4 py-1 font-bold text-gray-700 align-top pl-4">FREQUENT FLYER</td>
                  <td className="w-1/4 py-1 font-mono text-gray-900 align-top">
                   —
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-gray-700 align-top">E-TICKET NUMBER</td>
                  <td className="py-1 font-mono font-bold text-gray-900 align-top">{ticketNumber}</td>
                  <td className="py-1 font-bold text-gray-700 align-top pl-4">BOOKING REFERENCE</td>
                  <td className="py-1 font-mono font-bold text-gray-900 align-top">{pnrReference}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-gray-700 align-top">ISSUED BY/DATE</td>
                  <td className="py-1 text-gray-900 align-top" colSpan={3}>
                     {issueDate} {booking.place_of_issue || ''} / {airlineName} {booking.iata_code || ''}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Additional Passengers */}
            {additional_passengers && additional_passengers.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {additional_passengers.map((pax, idx) => (
                  <div key={idx} className="flex gap-8 text-[10px] py-1">
                    <span className="font-bold text-gray-700 w-1/4">PASSENGER {idx + 2}</span>
                    <span className="font-mono font-bold text-gray-900 uppercase">
                      {pax.last_name}/{pax.first_name}
                    </span>
                    <span className="text-gray-600 capitalize">({pax.passenger_type || 'Adult'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ────── TRAVEL INFORMATION ────── */}
        <div className="avoid-break">
          <div 
            className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: STYLES.sectionHeaderBg }}
          >
            Travel Information
          </div>
          
          <div className="px-6 py-3">
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1 pr-2 font-bold text-gray-700 w-[15%]">FLIGHT</th>
                  <th className="text-left py-1 pr-2 font-bold text-gray-700 w-[18%]">DEPART/ARRIVE</th>
                  <th className="text-left py-1 pr-2 font-bold text-gray-700 w-[22%]">AIRPORT/TERMINAL</th>
                  <th className="text-left py-1 pr-2 font-bold text-gray-700 w-[16%]">CHECK-IN OPENS</th>
                  <th className="text-left py-1 pr-2 font-bold text-gray-700 w-[14%]">CLASS</th>
                  <th className="text-left py-1 font-bold text-gray-700 w-[15%]">COUPON VALIDITY</th>
                </tr>
              </thead>
              <tbody>
                {/* Outbound Flight */}
                {flight && (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 pr-2 align-top">
                        <span className="font-mono font-bold text-gray-900">{flight?.flight?.number || 'N/A'}</span>
                        <br />
                        <span className="text-gray-500">CONFIRMED</span>
                      </td>
                      <td className="py-2 pr-2 align-top font-mono">
                        <span className="font-bold text-gray-900">{formatFlightDate(flight?.schedule?.departure)}</span>
                        <br />
                        <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(formatFlightTime(flight?.schedule?.departure) || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                        <br />
                        <br />
                        <span className="font-bold text-gray-900">{formatFlightDate(flight?.schedule?.arrival)}</span>
                        <br />
                      <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(formatFlightTime(flight?.schedule?.arrival) || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <span className="font-bold text-gray-900">{flight?.route?.origin?.iata || '???'}</span>
                        {flight?.route?.origin?.airport && (
                          <span className="text-gray-600"> ({flight.route.origin.airport})</span>
                        )}
                        {flight?.flight?.terminal && (
                          <span className="text-gray-600"><br />TERMINAL {flight.flight.terminal}</span>
                        )}
                        <br />
                        <br />
                        <span className="font-bold text-gray-900">{flight?.route?.destination?.iata || '???'}</span>
                        {flight?.route?.destination?.airport && (
                          <span className="text-gray-600"> ({flight.route.destination.airport})</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 align-top font-mono">
                        <span className="text-gray-900">{getCheckInOpens(flight?.schedule?.departure).date}</span>
                        <br />
                        <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(getCheckInOpens(flight?.schedule?.departure).time || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <span className="font-bold text-gray-900 uppercase">{flight?.flight?.cabin_class || 'ECONOMY'}</span>
                        <br />
                        <span className="text-gray-500">SEAT</span>
                        <br />
                        <span className="text-gray-500">BAGGAGE</span>
                        <br />
                        <span className="text-gray-500">ALLOWANCE</span>
                      </td>
                      <td className="py-2 align-top">
                        <span className="text-gray-500">NOT BEFORE</span>
                        <br />
                        <span className="font-mono text-gray-900">{getCouponValidity(flight?.schedule?.departure).notBefore}</span>
                        <br />
                        <span className="text-gray-500">NOT AFTER</span>
                        <br />
                        <span className="font-mono text-gray-900">{getCouponValidity(flight?.schedule?.departure).notAfter}</span>
                      </td>
                    </tr>
                    {/* Baggage row for outbound */}
                    <tr className="border-b-2 border-gray-400">
                      <td className="py-1 pr-2" colSpan={2}></td>
                      <td className="py-1 pr-2 text-gray-600">
                        {flight?.route?.destination?.city || ''}
                      </td>
                      <td className="py-1 pr-2"></td>
                      <td className="py-1 pr-2 font-mono font-bold text-gray-900">
                        {preferences?.seat_number || 'TBA'}
                        <br />
                        {baggage?.checked_count || 0}PC
                        <br />
                        {baggage?.checked_weight || 23}KGS
                      </td>
                      <td></td>
                    </tr>
                  </>
                )}

                {/* Return Flight */}
                {hasReturnFlight && returnFlightData && (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 pr-2 align-top">
                        <span className="font-mono font-bold text-gray-900">
                          {returnFlightData.flight_number || flight?.flight?.number || 'N/A'}
                        </span>
                        <br />
                        <span className="text-gray-500">CONFIRMED</span>
                      </td>
                      <td className="py-2 pr-2 align-top font-mono">
                        <span className="font-bold text-gray-900">{formatFlightDate(returnFlightData.departure_time)}</span>
                        <br />
                        <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(formatFlightTime(returnFlightData.departure_time) || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                        <br />
                        <br />
                        <span className="font-bold text-gray-900">{formatFlightDate(returnFlightData.arrival_time)}</span>
                        <br />
                        <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(formatFlightTime(returnFlightData.arrival_time) || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <span className="font-bold text-gray-900">{returnFlightData.origin?.iata || '???'}</span>
                        {returnFlightData.origin?.airport && (
                          <span className="text-gray-600"> ({returnFlightData.origin.airport})</span>
                        )}
                        {flight?.flight?.terminal && (
                          <span className="text-gray-600"><br />TERMINAL {flight.flight.terminal}</span>
                        )}
                        <br />
                        <br />
                        <span className="font-bold text-gray-900">{returnFlightData.destination?.iata || '???'}</span>
                        {returnFlightData.destination?.airport && (
                          <span className="text-gray-600"> ({returnFlightData.destination.airport})</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 align-top font-mono">
                        <span className="text-gray-900">{getCheckInOpens(returnFlightData.departure_time).date}</span>
                        <br />
                        <span className="text-gray-700 font-semibold font-mono">
  {(() => {
    const rawTime = String(getCheckInOpens(returnFlightData.departure_time).time || '');
    return rawTime.length === 4 
      ? `${rawTime.substring(0, 2)}:${rawTime.substring(2)}` 
      : rawTime;
  })()}
</span>
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <span className="font-bold text-gray-900 uppercase">{flight?.flight?.cabin_class || 'ECONOMY'}</span>
                        <br />
                        <span className="text-gray-500">SEAT</span>
                        <br />
                        <span className="text-gray-500">BAGGAGE</span>
                        <br />
                        <span className="text-gray-500">ALLOWANCE</span>
                      </td>
                      <td className="py-2 align-top">
                        <span className="text-gray-500">NOT BEFORE</span>
                        <br />
                        <span className="font-mono text-gray-900">{getCouponValidity(returnFlightData.departure_time).notBefore}</span>
                        <br />
                        <span className="text-gray-500">NOT AFTER</span>
                        <br />
                        <span className="font-mono text-gray-900">{getCouponValidity(returnFlightData.departure_time).notAfter}</span>
                      </td>
                    </tr>
                    {/* Baggage row for return */}
                    <tr className="border-b-2 border-gray-400">
                      <td className="py-1 pr-2" colSpan={2}></td>
                      <td className="py-1 pr-2 text-gray-600">
                        {returnFlightData.destination?.city || ''}
                      </td>
                      <td className="py-1 pr-2"></td>
                      <td className="py-1 pr-2 font-mono font-bold text-gray-900">
                        {preferences?.seat_number || 'TBA'}
                        <br />
                        {baggage?.checked_count || 0}PC
                        <br />
                        {baggage?.checked_weight || 23}KGS
                      </td>
                      <td></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ────── PASSENGER INFORMATION (from your code) ────── */}
        <div className="avoid-break border-b border-gray-200">
          <div 
            className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-2"
            style={{ backgroundColor: STYLES.sectionHeaderBg }}
          >
            <Users className="h-3.5 w-3.5" /> Passenger Information ({allPassengers.length})
          </div>
          <div className="divide-y divide-gray-100">
            {allPassengers.map((pax, index) => (
              <div key={index} className="avoid-break px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                    style={
                      index === 0
                        ? { backgroundColor: '#6B7280', color: '#fff', borderColor: '#6B7280' }
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
                    <p className="font-semibold text-gray-800 text-sm">
                      {pax.first_name} {pax.last_name}
                      {index === 0 && (
                        <Badge className="ml-2 text-[10px] bg-gray-100 text-gray-700">Primary</Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
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
                  <div className="text-right text-[10px] text-gray-500">
                    <p className="flex items-center gap-1 justify-end"><Mail className="h-3 w-3" /> {contact?.email}</p>
                    <p className="flex items-center gap-1 mt-0.5 justify-end"><Phone className="h-3 w-3" /> {contact?.phone}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ────── BAGGAGE, PREFERENCES & FARE (from your code) ────── */}
        <div className="avoid-break grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-200">
          {/* Baggage */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <Luggage className="h-3.5 w-3.5 text-gray-500" /> Baggage
            </h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Checked:</span>
                <span className="font-semibold">{baggage?.checked_count || 0} pc(s) • {baggage?.checked_weight || 23}kg each</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hand Luggage:</span>
                <span className="font-semibold">{baggage?.hand_luggage_count || 0} pc(s) • 7kg each</span>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">
                Max dimensions: 55 × 38 × 22cm for hand luggage. Individual checked items over 32kg cannot be accepted.
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <Shield className="h-3.5 w-3.5 text-gray-500" /> Preferences
            </h3>
            <div className="space-y-2 text-[10px]">
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
                  <Badge className="text-[10px] bg-gray-600 text-white">Enabled</Badge>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
              <CreditCard className="h-3.5 w-3.5 text-gray-500" /> Fare
            </h3>
            {flight?.pricing && (
              <div className="space-y-2 text-[10px]">
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
                  <span className="text-gray-900">{formatCurrency(parseFloat(flight.pricing.total_price), flight.pricing.currency)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ────── FARE AND ADDITIONAL INFORMATION (IATA Standard) ────── */}
        <div className="avoid-break">
          <div 
            className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: STYLES.sectionHeaderBg }}
          >
            Fare and Additional Information
          </div>
          
          <div className="px-6 py-3">
            <div className="grid grid-cols-2 gap-8">
              {/* Left: Fare Breakdown */}
              <div className="text-[10px]">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-1 font-bold text-gray-700 w-2/5">FARE</td>
                      <td className="py-1 font-mono text-gray-900 text-right">
                        {flight?.pricing?.currency}{flight?.pricing?.base_price || '0'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-bold text-gray-700">TAXES/FEES/CHARGES</td>
                      <td className="py-1 font-mono text-gray-900 text-right">
                        {`${flight?.pricing?.currency}${flight?.pricing?.service_charge || '0'}`}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-300">
                      <td className="py-1.5 font-bold text-gray-900">TOTAL</td>
                      <td className="py-1.5 font-mono font-bold text-gray-900 text-right">
                        {flight?.pricing?.currency}{flight?.pricing?.total_price || '0'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-bold text-gray-700">FORM OF PAYMENT</td>
                      <td className="py-1 text-gray-900 text-right uppercase">
                       CREDIT CARD
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[9px] text-gray-500 mt-2 italic">
                  *AT CHECK-IN YOU MAY NEED TO PRESENT THE CREDIT CARD USED FOR PAYMENT OF THIS TICKET*
                </p>
              </div>

              {/* Right: Additional Information */}
              <div className="text-[10px]">
                <p className="font-bold text-gray-700 mb-2">ADDITIONAL INFORMATION</p>
                <p className="text-gray-700 leading-relaxed">
                  NON-END
                </p>
               
              </div>
            </div>
          </div>
        </div>

        {/* ────── FARE CALCULATIONS ────── */}
        <div className="avoid-break">
          <div 
            className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: STYLES.sectionHeaderBg }}
          >
            Fare Calculations
          </div>
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">

  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wide leading-relaxed antialiased">
   
    {flight?.route?.origin?.iata || 'XXX'} {airlineCode || 'XX'} Q {flight?.route?.destination?.iata || 'XXX'} M/{flight?.pricing?.base_price || '0.00'} END GBP {flight?.pricing?.base_price || '0.00'}
  </p>
</div>
        </div>

        {/* ────── IMPORTANT INFORMATION (from your code) ────── */}
        <div className="avoid-break border-b border-gray-200 px-6 py-4 bg-[#F9FAFB]">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 tracking-wide">Important Information</h3>
          <ul className="text-[10px] text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>Please arrive at the airport 3 hours before departure. At most airports check-in closes 60 minutes before departure.</li>
            <li>Valid photo ID (passport/national ID) required for all passengers. Check visa requirements for your destination.</li>
            <li>Check with your departure airport for restrictions on liquids, aerosols and gels in hand baggage.</li>
            <li>Dangerous goods such as explosives, compressed gases, flammable liquids, oxidizing materials, and lithium batteries are forbidden.</li>
            <li>The UAE has a strict zero-tolerance anti-drugs policy. Possession of illegal drugs will be subject to punishment.</li>
          </ul>
        </div>

        {/* ────── FOOTER ────── */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 text-[9px] text-gray-500">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-gray-400" />
            <span>© {new Date().getFullYear()} {airlineName}. All rights reserved.</span>
          </div>
          <div className="text-right">
            <span>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
            <span className="ml-4">Page 1 of 1</span>
          </div>
        </div>

      </div>
    </>
  );
}