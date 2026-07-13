// src/routes/dashboard.bookings.$bookingId.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Loader2, AlertTriangle, Pencil, Printer, Trash2, ArrowLeft,
  User, Mail, Phone, MapPin, CreditCard, Plane, Clock,
  Luggage, Shield, FileText, Ticket, Users, Baby, Accessibility
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/types/booking";
import { bookingService } from "@/services/booking-service";
import { formatCurrency, formatTime, formatDuration } from "@/lib/formatters";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/dashboard/bookings/$bookingId/view")({
  head: () => ({ meta: [{ title: "Booking Details — SkyLedger" }] }),
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await bookingService.deleteBooking(Number(bookingId));
            toast.success('Booking Deleted', {
        description: 'The booking has been deleted successfully.',
      });

      navigate({ to: '/dashboard/bookings' });
    } catch (err: any) {
            toast.error('Error', {
        description: err.response?.data?.message || 'Failed to delete booking.',
      });

    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(Number(bookingId));
           toast.success('Booking Cancelled', {
        description: 'The booking has been cancelled.',
      });

      fetchBooking();
    } catch (err: any) {
            toast.error('Error', {
        description: err.response?.data?.message || 'Failed to cancel booking.',
      });

    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-slate-600">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{error || 'Booking Not Found'}</h3>
        <Button onClick={() => navigate({ to: '/dashboard/bookings' })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings
        </Button>
      </div>
    );
  }

  const { passenger, flight, contact, address, preferences, status, additional_passengers, baggage, assistance, remarks } = booking;
  const allPassengers = [
    { ...passenger, type: 'primary_adult', passenger_type: 'adult' },
    ...(additional_passengers || []),
  ];

  return (
    <>
      <PageHeader
        title={`Booking ${booking.booking_id}`}
        subtitle="View and manage booking details"
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Bookings", to: "/dashboard/bookings" },
          { label: booking.booking_id },
        ]}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate({ to: '/dashboard/bookings/$bookingId/edit', params: { bookingId } })} disabled={status.booking === 'cancelled'}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/dashboard/ticket/$bookingId', params: { bookingId } })}>
              <Printer className="h-4 w-4 mr-2" /> Print Ticket
            </Button>
            {status.booking === 'confirmed' && (
              <Button variant="outline" className="text-amber-600 border-amber-200" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            )}
            <Button variant="outline" className="text-red-600 border-red-200" onClick={() => setDeleteOpen(true)} disabled={status.booking === 'confirmed'}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <div className={`rounded-xl p-4 mb-6 ${status.booking === 'confirmed' ? 'bg-green-50 border border-green-200' : status.booking === 'cancelled' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.booking === 'confirmed' ? 'bg-green-500' : status.booking === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <div>
              <p className="font-semibold text-slate-900">Booking {status.booking.charAt(0).toUpperCase() + status.booking.slice(1)}</p>
              <p className="text-sm text-slate-600">Created on {new Date(booking.created_at).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <Badge 
  variant={status.ticket === 'generated' ? 'outline' : 'secondary'}
  className={status.ticket === 'generated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' : ''}
>
  Ticket: {status.ticket === 'generated' ? 'Generated' : 'Pending'}
</Badge>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Flight Details */}
          {flight && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /> Flight Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {flight.airline?.logo ? (
                    <img src={flight.airline.logo} alt={flight.airline.name} className="h-14 w-14 object-contain rounded-lg bg-slate-50 p-2" />
                  ) : (
                    <div className="h-14 w-14 bg-slate-100 rounded-lg flex items-center justify-center"><Plane className="h-7 w-7 text-slate-400" /></div>
                  )}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{flight.airline?.name}</h4>
                    <p className="text-sm text-slate-500">Flight {flight.flight?.number} • {flight.flight?.cabin_class}</p>
                    {flight.flight?.aircraft && <p className="text-xs text-slate-400 mt-0.5">Aircraft: {flight.flight.aircraft}</p>}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-3xl font-bold text-slate-900">{flight.route?.origin?.iata}</p>
                      <p className="text-sm text-slate-600 mt-1">{flight.route?.origin?.city}</p>
                      <p className="text-xs text-slate-400">{flight.route?.origin?.airport}</p>
                      <p className="text-lg font-semibold text-slate-800 mt-2">{formatTime(flight.schedule?.departure || '')}</p>
                      <p className="text-xs text-slate-400">{new Date(flight.schedule?.departure || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="text-sm text-slate-500 font-medium mb-2">{formatDuration(flight.schedule?.duration || '')}</div>
                      <div className="relative w-full"><div className="border-t-2 border-slate-300"></div><Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary bg-slate-50 p-0.5" /></div>
                      <Badge 
  variant="outline" 
  className={`mt-2 text-xs border-transparent ${
    flight.schedule?.stops === 0 
      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200' 
      : 'bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200'
  }`}
>
  {flight.schedule?.stops === 0 ? 'Direct Flight' : `${flight.schedule?.stops} Stop(s)`}
</Badge>

                    </div>
                    <div className="text-center flex-1">
                      <p className="text-3xl font-bold text-slate-900">{flight.route?.destination?.iata}</p>
                      <p className="text-sm text-slate-600 mt-1">{flight.route?.destination?.city}</p>
                      <p className="text-xs text-slate-400">{flight.route?.destination?.airport}</p>
                      <p className="text-lg font-semibold text-slate-800 mt-2">{formatTime(flight.schedule?.arrival || '')}</p>
                      <p className="text-xs text-slate-400">{new Date(flight.schedule?.arrival || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Return Flight if exists */}
                {flight.return_flight && flight.return_flight.departure_time && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Return Flight</p>
                    <div className="bg-slate-50 rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <p className="text-3xl font-bold text-slate-900">{flight.return_flight.origin?.iata}</p>
                          <p className="text-sm text-slate-600 mt-1">{flight.return_flight.origin?.city}</p>
                          <p className="text-lg font-semibold text-slate-800 mt-2">{formatTime(flight.return_flight.departure_time || '')}</p>
                          <p className="text-xs text-slate-400">{new Date(flight.return_flight.departure_time || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                          <div className="text-sm text-slate-500 font-medium mb-2">{formatDuration(flight.return_flight.duration || '')}</div>
                          <div className="relative w-full"><div className="border-t-2 border-slate-300"></div><Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 bg-slate-50 p-0.5 rotate-180" /></div>
                          <Badge 
  variant="outline" 
  className={`mt-2 text-xs border-transparent ${
    (flight.return_flight?.stops || 0) === 0 
      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200' 
      : 'bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200'
  }`}
>
  {(flight.return_flight?.stops || 0) === 0 ? 'Direct Flight' : `${flight.return_flight.stops} Stop(s)`}
</Badge>

                        </div>
                        <div className="text-center flex-1">
                          <p className="text-3xl font-bold text-slate-900">{flight.return_flight.destination?.iata}</p>
                          <p className="text-sm text-slate-600 mt-1">{flight.return_flight.destination?.city}</p>
                          <p className="text-lg font-semibold text-slate-800 mt-2">{formatTime(flight.return_flight.arrival_time || '')}</p>
                          <p className="text-xs text-slate-400">{new Date(flight.return_flight.arrival_time || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <DetailChip icon={<Clock className="h-4 w-4" />} label="Duration" value={formatDuration(flight.schedule?.duration || '')} />
                  <DetailChip icon={<Plane className="h-4 w-4" />} label="Cabin" value={flight.flight?.cabin_class || 'N/A'} />
                  <DetailChip icon={<Luggage className="h-4 w-4" />} label="Baggage" value={`${baggage?.checked_count || 0} checked, ${baggage?.hand_luggage_count || 0} hand`} />
                  <DetailChip icon={<Shield className="h-4 w-4" />} label="Stops" value={flight.schedule?.stops === 0 ? 'Direct' : `${flight.schedule?.stops}`} />
                </div>
              </div>
            </div>
          )}

          {/* All Passengers */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Passengers ({allPassengers.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {allPassengers.map((pax, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-blue-600 text-white' : pax.passenger_type === 'infant' ? 'bg-pink-100 text-pink-700' : pax.passenger_type === 'child' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>{index + 1}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{pax.first_name} {pax.last_name} {index === 0 && <Badge className="ml-1 text-[10px] bg-blue-100 text-blue-700">Primary</Badge>}</p>
                      <p className="text-xs text-slate-500 capitalize">{pax.passenger_type || 'Adult'}{pax.gender ? ` • ${pax.gender}` : ''}{pax.nationality ? ` • ${pax.nationality}` : ''}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs ml-11">
                    {pax.passport_number && <InfoField label="Passport" value={pax.passport_number} />}
                    {pax.date_of_birth && <InfoField label="DOB" value={pax.date_of_birth} />}
                    {/* {pax.cnic && <InfoField label="CNIC/ID" value={pax.cnic} />} */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Contact Information</h3></div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Email" value={contact.email} icon={<Mail className="h-4 w-4 text-slate-400" />} />
                <InfoField label="Phone" value={contact.phone} icon={<Phone className="h-4 w-4 text-slate-400" />} />
                <InfoField label="Emergency Contact" value={contact.emergency_contact || '—'} icon={<Phone className="h-4 w-4 text-slate-400" />} />
              </div>
            </div>
          </div>

          {/* Address */}
          {(address.address || address.city || address.country) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Address</h3></div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Street Address" value={address.address || '—'} />
                  <InfoField label="City" value={address.city || '—'} />
                  <InfoField label="Country" value={address.country || '—'} />
                  <InfoField label="Post Code" value={address.zip_code || '—'} />
                </div>
              </div>
            </div>
          )}

          {/* Preferences & Accessibility */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /> Preferences & Accessibility</h3></div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoField label="Seat Number" value={preferences.seat_number || '—'} />
                <InfoField label="Meal Preference" value={preferences.meal_preference ? preferences.meal_preference.replace(/_/g, ' ') : 'Regular'} />
                <InfoField label="Wheelchair" value={assistance?.wheelchair === 'none' ? 'Not Required' : (assistance?.wheelchair || 'None').replace(/_/g, ' ')} />
                <InfoField label="Priority Pass" value={assistance?.priority_pass ? '✅ Enabled' : '❌ Not Required'} />
                {preferences.special_assistance && <div className="col-span-2"><InfoField label="Special Assistance" value={preferences.special_assistance} /></div>}
              </div>
            </div>
          </div>

          {/* Remarks */}
          {remarks && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Remarks</h3></div>
              <div className="p-6"><p className="text-slate-700 whitespace-pre-wrap">{remarks}</p></div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pricing */}
          {flight?.pricing && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Price Details</h3></div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Base Fare</span><span className="font-medium">{formatCurrency(parseFloat(flight.pricing.base_price), flight.pricing.currency)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Service Charge</span><span className="font-medium">{formatCurrency(parseFloat(flight.pricing.service_charge), flight.pricing.currency)}</span></div>
                  <div className="flex justify-between font-semibold text-base pt-3 border-t"><span>Grand Total</span><span className="text-primary">{formatCurrency(parseFloat(flight.pricing.total_price), flight.pricing.currency)}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Booking References */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900 flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Booking References</h3></div>
            <div className="p-6 space-y-3">
              <div><p className="text-xs text-slate-500 font-medium mb-1">Booking ID</p><p className="font-mono text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{booking.booking_id}</p></div>
              {booking.pnr_number && <div><p className="text-xs text-slate-500 font-medium mb-1">PNR Number</p><p className="font-mono text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{booking.pnr_number}</p></div>}
              {booking.eticket_number && <div><p className="text-xs text-slate-500 font-medium mb-1">E-Ticket Number</p><p className="font-mono text-sm font-semibold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{booking.eticket_number}</p></div>}
              <div><p className="text-xs text-slate-500 font-medium mb-1">Status</p><Badge 
  variant={status.booking === 'cancelled' ? 'destructive' : status.booking === 'confirmed' ? 'outline' : 'secondary'}
  className={status.booking === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' : ''}
>
  {status.booking.charAt(0).toUpperCase() + status.booking.slice(1)}
</Badge>
</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete booking {booking.booking_id}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}

function DetailChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
      <div className="text-slate-400">{icon}</div>
      <div><p className="text-xs text-slate-500">{label}</p><p className="text-sm font-medium text-slate-900">{value}</p></div>
    </div>
  );
}