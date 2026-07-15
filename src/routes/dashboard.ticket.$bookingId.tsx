// src/routes/dashboard.ticket.$bookingId.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Printer, Loader2, AlertTriangle, Plane,
  Users, Luggage, Shield, Phone, Mail, Ticket,
  ArrowRight, Clock, MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";
import { bookingService } from "@/services/booking-service";
import { formatTime, formatDuration } from "@/lib/formatters";

export const Route = createFileRoute("/dashboard/ticket/$bookingId")({
  head: () => ({ meta: [{ title: "E-Ticket — SkyLedger" }] }),
  component: TicketPage,
});

const COLORS = {
  headerBg: "#6b7280",
  headerBg2: "#9ea3ac",
  headerText: "#FFFFFF",
  confirmedBg: "#059669",
  confirmedText: "#FFFFFF",
  border: "#D1D5DB",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  bgLight: "#F9FAFB",
  accent: "#6366F1",
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
      if (response.success && response.data) setBooking(response.data);
      else setError('Booking not found');
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
  const allPassengers = [
    { ...passenger, type: 'primary_adult', passenger_type: 'adult' },
    ...(additional_passengers || []),
  ];
  const hasReturnFlight = flight?.return_flight && flight?.return_flight?.departure_time;
  const returnFlightData = flight?.return_flight;
  const airlineName = flight?.airline?.name || 'Airline';
  const ticketNumber = booking.eticket_number || booking.booking_id;
  const pnrReference = booking.pnr_number || booking.booking_id;
  const issueDate = booking.created_at 
    ? new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : 'N/A';

  // Collect all segments for outbound and return
  const outboundSegments = flight?.segments || [];
  const returnSegments = returnFlightData?.segments || [];

  const hasOutboundSegments = outboundSegments.length > 0;
const hasReturnSegments = returnSegments.length > 0;

  const formatDate = (d?: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeShort = (d?: string) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <>
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
          actions={<Button onClick={() => window.print()} size="lg"><Printer className="h-4 w-4 mr-2" /> Print Ticket</Button>}
        />
      </div>

      <div className="ticket-document max-w-[210mm] mx-auto bg-white text-gray-900 font-sans shadow-xl overflow-hidden border border-gray-300">

        {/* ────── HEADER ────── */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {flight?.airline?.logo ? (
              <img src={flight.airline.logo} alt={airlineName} className="h-14 w-14 object-contain rounded bg-white p-1 shadow-sm border border-gray-100" />
            ) : (
              <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center border border-gray-200"><Plane className="h-7 w-7 text-gray-500" /></div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{airlineName}</h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 mt-1">Electronic Ticket & Passenger Itinerary Receipt</p>
            </div>
          </div>
        </div>

        {/* ────── LEGAL + TICKET NUMBER ────── */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-6">
            <div className="text-[11px] text-gray-600 leading-relaxed flex-1">
             <p>
                Your electronic ticket is stored in our computer reservation system. This e-Ticket receipt / Itinerary is your record of your electronic ticket and forms part of your contract of carriage. You may need to show this receipt to enter the airport and/or to prove return or onward travel to customs and immigration officials.
              </p>
              <p className="mt-1">
                Your attention is drawn to the Conditions of Contract and Other Important Notices set out in the attached document. Please visit us on <span className="text-blue-600 underline">www.{airlineName.toLowerCase().replace(/\s+/g, '')}.com</span> to check-in online and for more information.
              </p>
            </div>
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


        {/* ────── BOOKING REFERENCE ────── */}
        <div className="px-6 py-3 flex items-center justify-between bg-white border-b border-gray-200">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Booking Reference</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold tracking-widest text-gray-900">{booking.booking_id}</span>
              <Badge className="text-[8px] px-2 py-0.5" style={{ backgroundColor: COLORS.confirmedBg, color: COLORS.confirmedText }}>CONFIRMED</Badge>
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
            style={{ backgroundColor: COLORS.headerBg }}
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


       {/* ────── TRAVEL INFORMATION - EXTRA CONGESTED ────── */}
        <div className=" border rounded" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bgLight }}>
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5" style={{ backgroundColor: COLORS.headerBg }}>
            <Plane className="h-3 w-3" /> Travel Information
          </div>
          
          <div className="px-3 py-1.5 space-y-2">
            
            {/* OUTBOUND JOURNEY */}
            <div>
              <h3 className="text-[11px] font-bold flex items-center gap-1.5 leading-none mb-1" style={{ color: COLORS.textPrimary }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.headerBg }}></div>
                Outbound
                <span className="text-[10px] font-normal" style={{ color: COLORS.textMuted }}>
                  ({flight?.route?.origin?.iata} → {flight?.route?.destination?.iata})
                </span>
              </h3>

              {outboundSegments.length > 0 ? (
                <div className="avoid-break space-y-1">
                  {outboundSegments.map((seg: any, idx: number) => (
                    <JourneySegmentCard
                      key={seg.id || idx}
                      segment={seg}
                      index={idx}
                      total={outboundSegments.length}
                      seatNumber={preferences?.seat_number ?? undefined}
                      baggageCount={baggage?.checked_count || 0}
                    />
                  ))}
                </div>
              ) : (
                <JourneySegmentCard
                  segment={{
                    flight_number: flight?.flight?.number,
                    airline_name: airlineName,
                    airline_iata: flight?.airline?.code || '',
                    aircraft: flight?.flight?.aircraft,
                    origin: flight?.route?.origin,
                    destination: flight?.route?.destination,
                    departure_time: flight?.schedule?.departure,
                    arrival_time: flight?.schedule?.arrival,
                    duration: flight?.schedule?.duration,
                    cabin_class: flight?.flight?.cabin_class,
                    terminal: flight?.flight?.terminal,
                  }}
                  index={0}
                  total={1}
                  seatNumber={preferences?.seat_number ?? undefined}
                  baggageCount={baggage?.checked_count || 0}
                />
              )}

              {/* Layover info */}
              {outboundSegments.length > 1 && (
                <div className="mt-1 ml-2 pl-2 border-l" style={{ borderColor: COLORS.border }}>
                  {outboundSegments.slice(0, -1).map((seg: any, idx: number) => {
                    const nextSeg = outboundSegments[idx + 1];
                    const layoverDuration = getLayoverDuration(
                      seg.arrival_time || seg.arriving_at, 
                      nextSeg?.departure_time || nextSeg?.departing_at
                    );
                    const layoverAirport = typeof seg.destination?.airport === 'string' 
                      ? seg.destination.airport 
                      : (seg.destination?.name || seg.destination?.iata_code || seg.destination?.iata || '');
                    const layoverCity = typeof seg.destination?.city === 'string'
                      ? seg.destination.city
                      : (seg.destination?.city_name || '');
                    
                    return (

        <div key={idx} className="text-[10px] text-amber-700 py-2">

          <Clock className="h-3 w-3 inline mr-1" />

          <span className="font-semibold">Layover: {layoverDuration}</span> at{' '}

          <span className="font-medium">{layoverAirport}</span>

          {layoverCity ? <span> ({layoverCity})</span> : null}

        </div>

      ); 
                  })}
                </div>
              )}
            </div>

            {/* RETURN JOURNEY */}
            {hasReturnFlight && returnFlightData && (
              <div className="avoid-break pt-1.5 border-t border-dashed" style={{ borderColor: COLORS.border }}>
                <h3 className="text-[11px] font-bold flex items-center gap-1.5 leading-none mb-1" style={{ color: COLORS.textPrimary }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.headerBg }}></div>
                  Return
                  <span className="text-[10px] font-normal" style={{ color: COLORS.textMuted }}>
                    ({returnFlightData.origin?.iata} → {returnFlightData.destination?.iata})
                  </span>
                </h3>

                {returnSegments.length > 0 ? (
                  <div className="space-y-1">
                    {returnSegments.map((seg: any, idx: number) => (
                      <JourneySegmentCard
                        key={seg.id || idx}
                        segment={seg}
                        index={idx}
                        total={returnSegments.length}
                        isReturn
                        seatNumber={preferences?.seat_number ?? undefined}
                        baggageCount={baggage?.checked_count || 0}
                      />
                    ))}
                  </div>
                ) : (
                  <JourneySegmentCard
                    segment={{
                      flight_number: returnFlightData.flight_number || flight?.flight?.number,
                      airline_name: airlineName,
                      airline_iata: flight?.airline?.code || '',
                      origin: returnFlightData.origin,
                      destination: returnFlightData.destination,
                      departure_time: returnFlightData.departure_time,
                      arrival_time: returnFlightData.arrival_time,
                      duration: returnFlightData.duration,
                      cabin_class: flight?.flight?.cabin_class,
                    }}
                    index={0}
                    total={1}
                    isReturn
                    seatNumber={preferences?.seat_number ?? undefined}
                    baggageCount={baggage?.checked_count || 0}
                  />
                )}

                {returnSegments.length > 1 && (
                  <div className="mt-1 ml-2 pl-2 border-l" style={{ borderColor: COLORS.border }}>
                    {returnSegments.slice(0, -1).map((seg: any, idx: number) => {
                      const nextSeg = returnSegments[idx + 1];
                      const layoverDuration = getLayoverDuration(
                        seg.arrival_time || seg.arriving_at, 
                        nextSeg?.departure_time || nextSeg?.departing_at
                      );
                      const layoverAirport = typeof seg.destination?.airport === 'string' 
                        ? seg.destination.airport 
                        : (seg.destination?.name || seg.destination?.iata_code || seg.destination?.iata || '');
                      const layoverCity = typeof seg.destination?.city === 'string'
                        ? seg.destination.city
                        : (seg.destination?.city_name || '');
                      
                      return (

        <div key={idx} className="text-[10px] text-amber-700 py-2">

          <Clock className="h-3 w-3 inline mr-1" />

          <span className="font-semibold">Layover: {layoverDuration}</span> at{' '}

          <span className="font-medium">{layoverAirport}</span>

          {layoverCity ? <span> ({layoverCity})</span> : null}

        </div>

      ); 
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ────── PASSENGER INFORMATION ────── */}
        <div className="avoid-break border-t border-gray-200">
          <div className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: COLORS.headerBg }}>
            <Users className="h-4 w-4 inline mr-2" /> Passengers ({allPassengers.length})
          </div>
          <div className="divide-y divide-gray-100">
            {allPassengers.map((pax, index) => (
              <div key={index} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-gray-700 text-white' : 
                    pax.passenger_type === 'infant' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                    'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>{index + 1}</div>
                <div>
  {/* Changed <p> to <span> to allow the nested <Badge> div */}
  <span className="block font-semibold text-gray-800 text-sm">
    {pax.first_name} {pax.last_name}{' '}
    {index === 0 && (
      <Badge className="ml-1 text-[10px] bg-gray-200 text-gray-700">
        Primary
      </Badge>
    )}
  </span>
  <p className="text-[10px] text-gray-500 capitalize">
    {pax.passenger_type || 'Adult'}
    {pax.gender ? ` • ${pax.gender}` : ''}
    {pax.passport_number ? ` • Passport: ${pax.passport_number}` : ''}
  </p>
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

        {/* ────── BAGGAGE & PREFERENCES ────── */}
        <div className="avoid-break grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
          <div className="p-5">
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2"><Luggage className="h-3.5 w-3.5 text-gray-500" /> Baggage</h3>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
  <span className="text-gray-500">Checked:</span>
  <span className="font-semibold">
    {baggage?.checked_count || 0}x{baggage?.checked_kg || 23}kg ({((baggage?.checked_count || 0) * (baggage?.checked_kg || 23))}kg total)
  </span>
</div>
<div className="flex justify-between">
  <span className="text-gray-500">Hand:</span>
  <span className="font-semibold">
    {baggage?.hand_luggage_count || 0}x{baggage?.hand_luggage_kg || 7}kg ({((baggage?.hand_luggage_count || 0) * (baggage?.hand_luggage_kg || 7))}kg total)
  </span>
</div>
            <p className="text-[9px] text-gray-500 mt-2 leading-relaxed">
                Max dimensions: 55 × 38 × 22cm for hand luggage. Individual checked items over 32kg cannot be accepted.
              </p>

            </div>
          </div>
          <div className="p-5">
  <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 tracking-wide">
    <Shield className="h-3.5 w-3.5 text-gray-500" /> Preferences
  </h3>
  <div className="space-y-2 text-[10px]">
    {/* Seat Number */}
    <div className="flex justify-between">
      <span className="text-gray-500">Seat Number:</span>
      <span className="font-semibold">{preferences?.seat_number || 'TBA'}</span>
    </div>
    
    {/* Seat Preference - NEW */}
    <div className="flex justify-between">
      <span className="text-gray-500">Seat Preference:</span>
      <span className="font-semibold">
        {preferences?.seat_preference === 'window' ? '🪟 Window' :
         preferences?.seat_preference === 'aisle' ? '🚶 Aisle' :
         preferences?.seat_preference === 'middle' ? '💺 Middle' : '—'}
      </span>
    </div>
    
    {/* Extra Legroom - NEW */}
    <div className="flex justify-between">
      <span className="text-gray-500">Extra Legroom:</span>
      <span className="font-semibold">
        {preferences?.extra_legroom ? (
          <span className="text-[9px] text-black">✅ Yes</span>
        ) : (
          <span className="text-gray-400">— No</span>
        )}
      </span>
    </div>

    {/* Economy Delight - NEW */}
<div className="flex justify-between">
  <span className="text-gray-500">Economy Delight:</span>
  <span className="font-semibold">
    {preferences?.economy_delight ? (
      <span className="text-[9px] text-black">✅ Yes</span>
    ) : (
      <span className="text-gray-400">— No</span>
    )}
  </span>
</div>
    
    {/* Meal */}
    <div className="flex justify-between">
      <span className="text-gray-500">Meal:</span>
      <span className="font-semibold capitalize">
        {preferences?.meal_preference ? preferences.meal_preference.replace(/_/g, ' ') : 'Regular'}
      </span>
    </div>
    
    {/* Wheelchair */}
    <div className="flex justify-between">
      <span className="text-gray-500">Wheelchair:</span>
      <span className="font-semibold">
        {assistance?.wheelchair === 'none' ? 'Not Required' : assistance?.wheelchair?.replace(/_/g, ' ') || 'None'}
      </span>
    </div>
    
    {/* Priority Pass */}
    <div className="flex justify-between items-center">
      <span className="text-gray-500">Priority Pass:</span>
      {assistance?.priority_pass ? (
        <Badge className="text-[10px] bg-green-600 text-white">Enabled</Badge>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  </div>
</div>
        </div>

        {/* ────── IMPORTANT INFORMATION ────── */}
        <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
          <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-3 tracking-wide">Important Information</h3>
          
          <div className="text-[10px] text-gray-600 space-y-4 leading-relaxed">
            {/* Cabin Baggage */}
            <div>
              <p className="font-bold text-gray-800 mb-1">Cabin Baggage Allowances</p>
              <p><span className="font-semibold">Economy Class:</span> One piece permitted, max 55×38×22cm (22×15×8 inches), max 7kg (15lb). If boarding in India, max 115cm total dimensions. Brazil origin: 10kg (22lb).</p>
              <p className="mt-1"><span className="font-semibold">Premium Economy:</span> One piece, max 55×38×22cm, max 10kg (22lb). India boarding: max 115cm total.</p>
              <p className="mt-1"><span className="font-semibold">First & Business Class:</span> Two pieces: one briefcase (max 45×35×20cm) plus one handbag (max 55×38×22cm) or garment bag (max 20cm thick folded). Each max 7kg, combined max 14kg.</p>
              <p className="mt-1"><span className="font-semibold">Infants:</span> One checked bag max 55×38×22cm, 23kg (piece concept) or 10kg (weight concept). One carry-cot or collapsible stroller permitted if space available.</p>
            </div>

            {/* Checked Baggage */}
            <div>
              <p className="font-bold text-gray-800 mb-1">Checked Baggage Notification</p>
              <p>Allowances vary by fare type and class. Additional allowances may apply based on frequent flyer tier. Individual items over 32kg cannot be accepted for health and safety reasons.</p>
            </div>

            {/* Hazardous Materials */}
            <div>
              <p className="font-bold text-gray-800 mb-1">Hazardous Materials Policy</p>
              <p>Carriage of hazardous materials (aerosols, fireworks, flammable liquids) is forbidden. Personal motorised vehicles (hoverboards, mini-Segways, self-balancing wheels) containing large lithium batteries are forbidden in both checked and hand baggage.</p>
            </div>

            
          </div>
        </div>

        {/* ────── FOOTER ────── */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 text-[9px] text-gray-500 bg-white">
          <div className="flex items-center gap-2"><Ticket className="h-4 w-4 text-gray-400" />© {new Date().getFullYear()} {airlineName}. All rights reserved.</div>
          <div>Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} | Page 1 of 1</div>
        </div>
      </div>
    </>
  );
}

// ============== JOURNEY SEGMENT CARD ==============
// Fix the JourneySegmentCard component

function JourneySegmentCard({
  segment, index, total, isReturn = false, seatNumber, baggageCount
}: {
  segment: any;
  index: number;
  total: number;
  isReturn?: boolean;
  seatNumber?: string;
  baggageCount?: number;
}) {
  // SAFELY extract string values - handle objects, strings, and undefined
  const getString = (value: any, fallback: string = 'N/A'): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // If it's an object with a name property (like airline object)
      return value.name || value.iata_code || value.iata || fallback;
    }
    return fallback;
  };

  const originIata = segment.origin?.iata || segment.origin?.iata_code || '???';
  const originCity = getString(segment.origin?.city || segment.origin?.city_name, '');
  const originAirport = typeof segment.origin?.airport === 'string' 
    ? segment.origin.airport 
    : (segment.origin?.name || '');
  const originTerminal = typeof segment.origin?.terminal === 'string' 
    ? segment.origin.terminal 
    : (segment.origin_terminal || '');

  const destIata = segment.destination?.iata || segment.destination?.iata_code || '???';
  const destCity = getString(segment.destination?.city || segment.destination?.city_name, '');
  const destAirport = typeof segment.destination?.airport === 'string'
    ? segment.destination.airport
    : (segment.destination?.name || '');
  const destTerminal = typeof segment.destination?.terminal === 'string'
    ? segment.destination.terminal
    : (segment.destination_terminal || '');

  const airlineName = getString(segment.airline_name || segment.marketing_carrier?.name || segment.operating_carrier?.name, 'Airline');
  const flightNumber = segment.flight_number 
    || segment.marketing_carrier_flight_number 
    || segment.operating_carrier_flight_number 
    || 'N/A';
  const aircraft = typeof segment.aircraft === 'string' ? segment.aircraft : (segment.aircraft?.name || 'N/A');
  const cabinClass = segment.cabin_class 
    || segment.cabin_class_marketing_name 
    || segment.passengers?.[0]?.cabin_class_marketing_name 
    || 'Economy';

  return (
  <div className="rounded-md border-2 overflow-hidden max-w-xxl mx-auto">
    {/* Segment Header */}
    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-white uppercase" style={{ backgroundColor: COLORS.headerBg2 }}>
      <div className="flex items-center gap-1.5">
        <Plane className={`h-2.5 w-2.5 ${isReturn ? 'rotate-180' : ''}`} />
        <span>Leg {index + 1}/{total}</span>
        <span className="text-white/40">|</span>
        <span>{cabinClass}</span>
      </div>
      <span className="font-mono text-[10px] tracking-wider">{flightNumber}</span>
    </div>

    {/* Route Details */}
    <div className="p-2.5 bg-white">
      <div className="flex items-center justify-between gap-1">
        {/* Departure */}
        <div className="text-center flex-1 min-w-0">
          <p className="text-lg font-black leading-tight" style={{ color: COLORS.textPrimary }}>{originIata}</p>
          <div className="text-[9px] truncate" style={{ color: COLORS.textSecondary }}>
            {originCity}{originAirport ? ` (${originAirport})` : ''}
          </div>
          {originTerminal && <p className="text-[8px] font-medium" style={{ color: COLORS.textMuted }}>Term {originTerminal}</p>}
          
          <div className="mt-1 pt-1 border-t border-gray-50">
            <p className="text-[8px] uppercase tracking-wide font-semibold" style={{ color: COLORS.textMuted }}>Depart</p>
            <p className="text-sm font-bold leading-tight" style={{ color: COLORS.textPrimary }}>{formatTime(segment.departure_time || segment.departing_at)}</p>
            <p className="text-[8px] whitespace-nowrap" style={{ color: COLORS.textSecondary }}>
              {segment.departure_time || segment.departing_at 
                ? new Date(segment.departure_time || segment.departing_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) 
                : ''}
            </p>
          </div>
        </div>

        {/* Flight Path */}
        <div className="flex-[0.6] flex flex-col items-center px-1">
          <span className="text-[9px] font-medium mb-0.5" style={{ color: COLORS.textSecondary }}>{formatDuration(segment.duration || '')}</span>
          <div className="relative w-full">
            <div className="border-t border-dashed" style={{ borderColor: COLORS.border }}></div>
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 p-0.5" style={{ color: COLORS.headerBg }} />
          </div>
          <span className="text-[8px] mt-0.5" style={{ color: COLORS.textMuted }}>Non-stop</span>
        </div>

        {/* Arrival */}
        <div className="text-center flex-1 min-w-0">
          <p className="text-lg font-black leading-tight" style={{ color: COLORS.textPrimary }}>{destIata}</p>
          <div className="text-[9px] truncate" style={{ color: COLORS.textSecondary }}>
            {destCity}{destAirport ? ` (${destAirport})` : ''}
          </div>
          {destTerminal && <p className="text-[8px] font-medium" style={{ color: COLORS.textMuted }}>Term {destTerminal}</p>}
          
          <div className="mt-1 pt-1 border-t border-gray-50">
            <p className="text-[8px] uppercase tracking-wide font-semibold" style={{ color: COLORS.textMuted }}>Arrive</p>
            <p className="text-sm font-bold leading-tight" style={{ color: COLORS.textPrimary }}>{formatTime(segment.arrival_time || segment.arriving_at)}</p>
            <p className="text-[8px] whitespace-nowrap" style={{ color: COLORS.textSecondary }}>
              {segment.arrival_time || segment.arriving_at
                ? new Date(segment.arrival_time || segment.arriving_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) 
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Summary Grid */}
      <div className="mt-2 pt-1.5 border-t grid grid-cols-4 gap-1 text-center text-[9px]" style={{ borderColor: COLORS.border }}>
        <div>
          <p style={{ color: COLORS.textMuted }}>Seat</p>
          <p className="font-bold truncate" style={{ color: COLORS.textPrimary }}>{seatNumber || 'TBA'}</p>
        </div>
        <div>
          <p style={{ color: COLORS.textMuted }}>Status</p>
          <div className="inline-block rounded px-1 text-[10px] bg-green-600 text-white font-medium scale-90 origin-top">Confirmed</div>
        </div>
        <div>
          <p style={{ color: COLORS.textMuted }}>Baggage</p>
          <p className="font-bold truncate" style={{ color: COLORS.textPrimary }}>{baggageCount || 0} pc(s)</p>
        </div>
        <div>
          <p style={{ color: COLORS.textMuted }}>Aircraft</p>
          <p className="font-bold truncate" style={{ color: COLORS.textPrimary }}>{aircraft}</p>
        </div>
      </div>
    </div>
  </div>
);
}

// Helper to calculate layover duration
function getLayoverDuration(arrival?: string, departure?: string): string {
  if (!arrival || !departure) return 'N/A';
  const diff = new Date(departure).getTime() - new Date(arrival).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}