// src/routes/dashboard.results.tsx

import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { FlightResultsWrapper } from '@/components/flight-results/FlightResultsWrapper';
import { useSearchState } from '@/hooks/useSearchState';

export const Route = createFileRoute('/dashboard/results')({
  head: () => ({ meta: [{ title: 'Flight Results — SkyLedger' }] }),
  component: ResultsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      searchId: search.searchId as number | undefined,
    };
  },
});

function ResultsPage() {
  const { searchResults, searchData } = useSearchState();

  return (
    <>
      <PageHeader
        title="Flight Results"
        subtitle={
          searchResults.length > 0
            ? `${searchResults.length} flights found`
            : searchData
            ? `Searching ${searchData.origin_iata} → ${searchData.destination_iata}`
            : 'Search Results'
        }
        crumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Search Flights', to: '/dashboard/search' },
          { label: 'Results' },
        ]}
      />
      <FlightResultsWrapper />
    </>
  );
}