// src/routes/dashboard.index.tsx

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Plane,
  Search,
  TicketCheck,
  TrendingUp,
  Loader2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { dashboardService, DashboardData } from "@/services/dashboard-service";
import { formatCurrency } from "@/lib/formatters";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — SkyLedger" }] }),
  component: DashboardHome,
});

const iconMap: Record<string, any> = {
  TicketCheck,
  CalendarClock,
  Printer: Clock,
  TrendingUp,
};

// Explicit status configuration mapping for uniform UI components
const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-100" },
  confirm: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-100" },
  pending: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-100" },
  cancelled: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-100" },
  cancel: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-100" },
  default: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
};

function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardData();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Loading your dashboard..." />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Something went wrong" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-slate-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Welcome back 👋"
        subtitle="Here's what's happening with your bookings today."
        actions={
          <Button asChild className="shadow-sm">
            <Link to="/dashboard/search">
              <Search className="h-4 w-4 mr-2" /> Quick Search
            </Link>
          </Button>
        }
      />

      {/* Stats Cards Dashboard Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const IconComponent = iconMap[stat.icon] || TicketCheck;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isPositive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : stat.change.includes('today') 
                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                      : 'bg-slate-50 text-slate-600 border border-slate-100'
                }`}>
                  {isPositive && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                  {stat.change}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 items-start">
        {/* Recent Bookings Table Segment */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 p-4 sm:px-5">
            <div>
              <h2 className="font-bold text-slate-800">Recent Bookings</h2>
              <p className="text-[11px] text-slate-400 font-medium">Latest customer transactions</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary-hover font-semibold">
              <Link to="/dashboard/bookings">View all</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Passenger</th>
                  <th className="px-5 py-3.5">Flight</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
  {data.recent_bookings.length > 0 ? (
    data.recent_bookings.map((booking) => {
      const config = statusConfig[booking.status.toLowerCase()] || statusConfig.default;
      
      return (
        <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors group">
          <td className="px-5 py-3.5 whitespace-nowrap">
            <Link
              to="/dashboard/bookings/$bookingId/view"
              params={{ bookingId: booking.id.toString() }}
              className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/40 px-2 py-1 rounded hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
              {booking.booking_id}
            </Link>
          </td>
          <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
            {booking.passenger}
          </td>
          <td className="px-5 py-3.5 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {booking.airline_logo && (
                <div className="h-6 w-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5">
                  <img
                    src={booking.airline_logo}
                    alt={booking.airline_name}
                    className="h-full w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <span className="font-medium text-slate-600 text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/30">
                {booking.flight_number}
              </span>
            </div>
          </td>
          <td className="px-5 py-3.5 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border capitalize ${config.bg} ${config.text} ${config.border}`}>
              {booking.status}
            </span>
          </td>
          <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-900">
            {formatCurrency(booking.amount, booking.currency)}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">
        <Sparkles className="h-6 w-6 text-slate-300 mx-auto mb-2" />
        <p className="text-sm">No bookings recorded yet.</p>
        <Link to="/dashboard/search" className="text-xs text-primary underline mt-1 inline-block hover:text-primary-hover">
          Create your first booking
        </Link>
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
          
          {data.recent_bookings.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/20 p-3 text-center">
              <Link
                to="/dashboard/bookings"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
              >
                View all bookings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Search Enquiries Stream */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between self-stretch">
          <div>
            <div className="border-b border-slate-100 bg-slate-50/40 p-4 sm:px-5">
              <h2 className="font-bold text-slate-800">Recent Queries</h2>
              <p className="text-[11px] text-slate-400 font-medium">Active lookup parameter logs</p>
            </div>
           <ul className="divide-y divide-slate-100">
  {data.recent_searches.length > 0 ? (
    data.recent_searches.map((search) => (
      <li key={search.id} className="flex items-center gap-3 p-4 hover:bg-slate-50/50 transition-colors group">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 border border-slate-200/30 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-all">
          <Plane className="h-4 w-4 -rotate-45" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-700">{search.route}</p>
          <p className="truncate text-[11px] text-slate-400 mt-0.5 font-medium">
            {search.pax} • <span className="capitalize">{search.trip_type === 'round_trip' ? 'Round Trip' : 'One Way'}</span>
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          {search.when}
        </span>
      </li>
    ))
  ) : (
    <div className="p-12 text-center text-slate-400 font-medium">
      <Plane className="h-6 w-6 mx-auto mb-2 text-slate-300 -rotate-45" />
      <p className="text-xs">No current route lookups</p>
    </div>
  )}
</ul>
          </div>
          
          <div className="p-4 bg-slate-50/20 border-t border-slate-100/60">
            <Button asChild variant="outline" className="w-full text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs">
              <Link to="/dashboard/search">New Search</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}