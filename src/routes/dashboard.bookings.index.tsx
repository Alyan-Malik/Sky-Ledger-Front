// src/routes/dashboard.bookings.index.tsx

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { 
  Eye, Pencil, Printer, Search, Trash2, Loader2, ChevronLeft, ChevronRight, 
  AlertTriangle, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Sparkles
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/booking-service";
import { BookingListItem, BookingsResponse } from "@/types/booking";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard/bookings/")({
  head: () => ({ meta: [{ title: "Bookings — SkyLedger" }] }),
  component: BookingsIndexPage,
});

function BookingsIndexPage() {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<BookingsResponse['meta'] | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const fetchBookings = useCallback(async (search?: string, pageNum?: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pageNum || page,
        per_page: 15,
      };

      if (search?.trim()) {
        params.q = search;
      }

      const response = await bookingService.getBookings(params);
      setBookings(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Debounce search input mutations instantly without waiting for a form submission
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setPage(1);
      fetchBookings(searchQuery, 1);
    }, 400);
    return () => clearTimeout(timeOutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchBookings(searchQuery, page);
  }, [page]);

  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    try {
      setUpdatingStatusId(bookingId);
      // Calls your endpoint implementation to alter state dynamically
      await bookingService.updateBookingStatus?.(bookingId, newStatus);
      
      toast.success('Status Updated', {
        description: `Booking status changed successfully to ${newStatus}.`,
      });

      // Local state mapping bypasses complete reloading delays instantly
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: { ...b.status, booking: newStatus } } : b));
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err.response?.data?.message || 'Could not update status runtime state.',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await bookingService.deleteBooking(deleteId);
      
      toast.success('Booking Deleted', {
        description: 'The booking has been deleted successfully.',
      });
      
      fetchBookings(searchQuery, page);
    } catch (err: any) {
      toast.error('Error', {
        description: err.response?.data?.message || 'Failed to delete booking.',
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Helper Badge Color Resolver
  const getStatusBadgeStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100/80';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100/80';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-100/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100/80';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-1.5 inline" />;
      case 'pending': return <Clock className="h-3.5 w-3.5 text-amber-600 mr-1.5 inline" />;
      case 'cancelled': return <XCircle className="h-3.5 w-3.5 text-rose-600 mr-1.5 inline" />;
      default: return <AlertCircle className="h-3.5 w-3.5 text-slate-600 mr-1.5 inline" />;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <>
        <PageHeader
          title="Bookings"
          subtitle="Manage all reservations in one place."
          crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Bookings" }]}
          actions={
            <Button asChild>
              <Link to="/dashboard/search">New Booking</Link>
            </Button>
          }
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <>
        <PageHeader
          title="Bookings"
          subtitle="Manage all reservations in one place."
          crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Bookings" }]}
          actions={
            <Button asChild>
              <Link to="/dashboard/search">New Booking</Link>
            </Button>
          }
        />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => fetchBookings(searchQuery, page)}>
            Try Again
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Manage all reservations in one place."
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Bookings" }]}
        actions={
          <Button asChild className="shadow-sm">
            <Link to="/dashboard/search">
              <Plus className="h-4 w-4 mr-2" /> New Booking
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Search Bar Utilities Area */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Instant search by name, ID, PNR or flight..."
              className="pl-9 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400"
            />
            {loading && searchQuery && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {meta && `Total Record Count: ${meta.total}`}
          </div>
        </div>

        {/* Beautiful Dynamic Data View Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Passenger</th>
                <th className="px-5 py-3.5">Flight</th>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5">PNR</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200/40">
                      {booking.booking_id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {booking.passenger.full_name}
                      </p>
                      {booking.eticket_number ? (
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          tkt: {booking.eticket_number}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-500 mt-0.5 italic">Ticket Pending</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {booking.flight.airline_logo && (
                        <div className="h-7 w-7 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5">
                          <img
                            src={booking.flight.airline_logo}
                            alt={booking.flight.airline_name}
                            className="h-full w-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">
                          {booking.flight.flight_number}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {booking.flight.airline_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{booking.flight.origin_iata}</span>
                      <span className="text-slate-300 font-normal">→</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{booking.flight.destination_iata}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      {booking.flight.cabin_class}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {booking.pnr_number ? (
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">
                        {booking.pnr_number}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                    {formatDate(booking.created_at)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(booking.flight.total_price, booking.flight.currency)}
                    </span>
                  </td>
                  
                  {/* Status Cell - Implements the manual interaction controller dropdown matrix */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {updatingStatusId === booking.id ? (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" /> Updating...
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${getStatusBadgeStyles(booking.status.booking)}`}>
                            {getStatusIcon(booking.status.booking)}
                            {booking.status.booking === 'confirmed' ? 'Confirmed' : booking.status.booking}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          <DropdownMenuLabel className="text-xs text-slate-400">Alter Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="text-xs font-medium text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800 cursor-pointer">
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-600" /> Mark Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'pending')} className="text-xs font-medium text-amber-700 focus:bg-amber-50 focus:text-amber-800 cursor-pointer">
                            <Clock className="mr-2 h-3.5 w-3.5 text-amber-600" /> Set Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="text-xs font-medium text-rose-700 focus:bg-rose-50 focus:text-rose-800 cursor-pointer">
                            <XCircle className="mr-2 h-3.5 w-3.5 text-rose-600" /> Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* View Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                        title="View Details"
                        onClick={() => navigate({
                          to: '/dashboard/bookings/$bookingId/view',
                          params: { bookingId: booking.id.toString() },
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                        title="Edit Booking"
                        disabled={booking.status.booking === 'cancelled'}
                        onClick={() => navigate({
                          to: '/dashboard/bookings/$bookingId/edit',
                          params: { bookingId: booking.id.toString() },
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Print Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-slate-100 text-slate-600"
                        title="Print Ticket"
                        onClick={() => navigate({
                          to: '/dashboard/ticket/$bookingId',
                          params: { bookingId: booking.id.toString() },
                        })}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        title="Delete Booking"
                        disabled={booking.status.booking === 'confirmed'}
                        onClick={() => setDeleteId(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && !loading && (
            <div className="p-16 text-center bg-slate-50/30">
              <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1.5">No bookings match your query.</p>
              <p className="text-xs text-slate-400 mb-4">Try refining your terms or clear filters.</p>
              <Button asChild variant="outline" size="sm" className="shadow-xs">
                <Link to="/dashboard/search">Create Your First Booking</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 p-4 text-sm font-medium text-slate-500">
            <span>
              Showing <span className="text-slate-800">{meta.from}</span> to <span className="text-slate-800">{meta.to}</span> of <span className="text-slate-800">{meta.total}</span> bookings
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-slate-200 text-slate-700 shadow-2xs"
                disabled={!meta || meta.current_page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-slate-200 text-slate-700 shadow-2xs"
                disabled={!meta || meta.current_page >= meta.last_page}
                onClick={() => setPage(p => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
              Only cancelled or pending bookings can be deleted from the database ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}