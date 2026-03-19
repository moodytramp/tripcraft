'use client';

import Link from 'next/link';
import { useTranslation } from '@tripcraft/i18n';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          marginBottom: 8,
        }}
      >
        {t('common.appName')}
      </h1>
      <p style={{ fontSize: 22, color: 'var(--color-text)', marginBottom: 4 }}>
        Smart Travel Planning
      </p>
      <p
        style={{
          fontSize: 18,
          color: 'var(--color-text-secondary)',
          marginBottom: 48,
        }}
      >
        Destinations, Flights & Hotels in One Place
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/search"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: 'var(--radius)',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {t('search.findDestinations')}
        </Link>
        <Link
          href="/profile"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            padding: '16px 32px',
            borderRadius: 'var(--radius)',
            fontSize: 18,
            fontWeight: 600,
            border: '2px solid var(--color-primary)',
          }}
        >
          {t('profile.title')}
        </Link>
      </div>
    </main>
  );
}
