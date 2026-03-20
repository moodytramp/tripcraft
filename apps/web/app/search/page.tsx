import type { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: 'Find Destinations — TripCraft',
  description:
    'Enter your passport and visas to instantly discover every destination you can reach — with visa status, cost, and safety info.',
};

export default function SearchPage() {
  return <SearchClient />;
}
