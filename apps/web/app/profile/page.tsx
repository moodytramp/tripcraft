import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Your Profile — TripCraft',
  description: 'Save your passports and visas to get personalised destination recommendations instantly.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
