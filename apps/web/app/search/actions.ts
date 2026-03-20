'use server';

import type { EligibleDestination } from '@tripcraft/types';

export interface SearchParams {
  passportCountries: string[]; // alpha-3
  visas: { destinationCountry: string; expiresAt: string; visaType: string }[];
  budgetUsd?: number;
  region?: string;
  sortBy: 'price' | 'safety' | 'temperature';
}

export interface SearchResult {
  destinations: EligibleDestination[];
  error?: string;
}

export async function searchDestinations(params: SearchParams): Promise<SearchResult> {
  const destinationServiceUrl =
    process.env['DESTINATION_SERVICE_URL'] ?? 'http://localhost:3002';

  if (params.passportCountries.length === 0) {
    return { destinations: [], error: 'Please select at least one passport.' };
  }

  try {
    const query = new URLSearchParams();

    query.set('passportCountries', params.passportCountries.join(','));

    if (params.visas.length > 0) {
      query.set(
        'visas',
        params.visas
          .map((v) => `${v.destinationCountry}:${v.expiresAt}:${v.visaType}`)
          .join(','),
      );
    }

    if (params.budgetUsd) {
      query.set('budgetUsd', String(params.budgetUsd));
    }

    if (params.region) {
      query.set('region', params.region);
    }

    query.set('sortBy', params.sortBy);

    const res = await fetch(
      `${destinationServiceUrl}/v1/destinations/eligible?${query.toString()}`,
      {
        // Don't cache — we want fresh eligibility results each search
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = (body as { error?: { message?: string } }).error?.message ?? 'Service error';
      return { destinations: [], error: message };
    }

    const destinations = (await res.json()) as EligibleDestination[];
    return { destinations };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === 'TimeoutError'
          ? 'Request timed out — the destination service may be starting up.'
          : err.message
        : 'Unknown error';
    return { destinations: [], error: message };
  }
}
