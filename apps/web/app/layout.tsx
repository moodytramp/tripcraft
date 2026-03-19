import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripCraft — Smart Travel Planning',
  description:
    'Destinations, Flights & Hotels in One Place. Input your passport, visas, and budget — get personalized trip recommendations instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
