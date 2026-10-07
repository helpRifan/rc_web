'use client';

import { RouteError } from '@/components/site/RouteError';

export default function EventsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <RouteError
      title="Events didn’t load"
      body="We couldn’t reach the events list. This is a problem on our side. Try again in a minute."
      reset={reset}
    />
  );
}
