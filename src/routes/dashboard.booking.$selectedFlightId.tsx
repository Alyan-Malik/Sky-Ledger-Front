// src/routes/dashboard.booking.$selectedFlightId.tsx

import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { BookingPage } from '@/pages/BookingPage';

export const Route = createFileRoute('/dashboard/booking/$selectedFlightId')({
  head: () => ({ meta: [{ title: 'Complete Booking — SkyLedger' }] }),
  component: BookingRoute,
});

function BookingRoute() {
  const { selectedFlightId } = Route.useParams();

  return (
    <>
      <PageHeader
        title="Complete Your Booking"
        subtitle="Review flight details and enter passenger information"
        crumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Search Flights', to: '/dashboard/search' },
          { label: 'Results', to: '/dashboard/results' },
          { label: 'Booking' },
        ]}
      />
      <BookingPage />
    </>
  );
}