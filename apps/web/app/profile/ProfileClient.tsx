'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  loadProfile,
  saveProfile,
  addPassport,
  removePassport,
  addVisa,
  removeVisa,
  type LocalProfile,
} from './store';
import { PASSPORT_COUNTRIES, DESTINATION_COUNTRIES, VISA_TYPES } from '../search/constants';

// ── Styles ──────────────────────────────────────────────────────────────────

const css = {
  page: { minHeight: '100vh', backgroundColor: 'var(--color-bg)' },
  hero: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '40px 24px 28px',
    textAlign: 'center' as const,
  },
  heroTitle: { fontSize: 32, fontWeight: 800, marginBottom: 6 },
  heroSub: { fontSize: 16, opacity: 0.85 },
  container: { maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px' },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' },
  label: {
    display: 'block' as const,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  row: { display: 'grid' as const, gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' as const },
  row3: { display: 'grid' as const, gridTemplateColumns: '1.5fr 1.5fr 1.5fr auto', gap: 10, marginBottom: 10, alignItems: 'end' as const },
  select: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 14,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '9px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 14,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    outline: 'none',
  },
  addBtn: {
    padding: '9px 16px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  removeBtn: {
    padding: '9px 12px',
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontSize: 16,
    lineHeight: 1,
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '0 8px 8px',
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '10px 8px',
    fontSize: 14,
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
  primaryBadge: {
    display: 'inline-block' as const,
    backgroundColor: '#eff6ff',
    color: 'var(--color-primary)',
    border: '1px solid #bfdbfe',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 6,
  },
  empty: { color: 'var(--color-text-secondary)', fontSize: 14, padding: '8px 0' },
  searchLink: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 'var(--radius)',
    fontWeight: 700,
    fontSize: 15,
    marginTop: 8,
  },
  devNote: {
    backgroundColor: '#fefce8',
    border: '1px solid #fef08a',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#854d0e',
    marginBottom: 20,
  },
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCountryName(code: string): string {
  return PASSPORT_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
function getDestName(code: string): string {
  return DESTINATION_COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
function getVisaLabel(value: string): string {
  return VISA_TYPES.find((t) => t.value === value)?.label ?? value;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ProfileClient() {
  const [profile, setProfile] = useState<LocalProfile>({ passports: [], visas: [], departureCountry: '' });
  const [loaded, setLoaded] = useState(false);

  // Passport form
  const [ppCountry, setPpCountry] = useState('');
  const [ppExpiry, setPpExpiry] = useState('');
  const [ppPrimary, setPpPrimary] = useState(false);

  // Visa form
  const [visaDest, setVisaDest] = useState('FR');
  const [visaType, setVisaType] = useState('schengen');
  const [visaExpiry, setVisaExpiry] = useState('');

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  const persist = useCallback((updated: LocalProfile) => {
    setProfile(updated);
    saveProfile(updated);
  }, []);

  const handleAddPassport = useCallback(() => {
    if (!ppCountry) return;
    persist(addPassport(profile, { countryCode: ppCountry, expiryDate: ppExpiry || null, isPrimary: ppPrimary }));
    setPpCountry('');
    setPpExpiry('');
    setPpPrimary(false);
  }, [profile, ppCountry, ppExpiry, ppPrimary, persist]);

  const handleAddVisa = useCallback(() => {
    if (!visaDest || !visaExpiry) return;
    persist(addVisa(profile, { destinationCountry: visaDest, visaType, expiryDate: visaExpiry }));
    setVisaExpiry('');
  }, [profile, visaDest, visaType, visaExpiry, persist]);

  const handleDeparture = useCallback((val: string) => {
    persist({ ...profile, departureCountry: val });
  }, [profile, persist]);

  if (!loaded) return null;

  return (
    <div style={css.page}>
      <div style={css.hero}>
        <h1 style={css.heroTitle}>Your Travel Profile</h1>
        <p style={css.heroSub}>Save your passports & visas — we pre-fill them on every search</p>
      </div>

      <div style={css.container}>
        <div style={css.devNote}>
          💾 Saved locally in your browser — no account needed. Sign in with Auth0 to sync across devices.
        </div>

        {/* ── Passports ─────────────────────────────────────────────────── */}
        <div style={css.card}>
          <p style={css.sectionTitle}>🛂 Passports</p>

          {/* Add form */}
          <div style={css.row}>
            <div>
              <label style={css.label}>Nationality (alpha-3)</label>
              <select value={ppCountry} onChange={(e) => setPpCountry(e.target.value)} style={css.select}>
                <option value="">— choose —</option>
                {PASSPORT_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} disabled={profile.passports.some((p) => p.countryCode === c.code)}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={css.label}>Expiry date (optional)</label>
              <input type="date" value={ppExpiry} onChange={(e) => setPpExpiry(e.target.value)} style={css.input} />
            </div>
            <button
              type="button"
              onClick={handleAddPassport}
              disabled={!ppCountry || profile.passports.length >= 3}
              style={{ ...css.addBtn, opacity: ppCountry ? 1 : 0.5, cursor: ppCountry ? 'pointer' : 'not-allowed' }}
            >
              + Add
            </button>
          </div>
          <label style={{ ...css.label, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <input type="checkbox" checked={ppPrimary} onChange={(e) => setPpPrimary(e.target.checked)} />
            Set as primary passport
          </label>

          {/* List */}
          {profile.passports.length === 0 ? (
            <p style={css.empty}>No passports saved yet.</p>
          ) : (
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Country</th>
                  <th style={css.th}>Expires</th>
                  <th style={css.th}></th>
                </tr>
              </thead>
              <tbody>
                {profile.passports.map((p) => (
                  <tr key={p.id}>
                    <td style={css.td}>
                      {getCountryName(p.countryCode)} ({p.countryCode})
                      {p.isPrimary && <span style={css.primaryBadge}>Primary</span>}
                    </td>
                    <td style={css.td}>{p.expiryDate ?? '—'}</td>
                    <td style={css.td}>
                      <button type="button" style={css.removeBtn} onClick={() => persist(removePassport(profile, p.id))}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Visas ─────────────────────────────────────────────────────── */}
        <div style={css.card}>
          <p style={css.sectionTitle}>📄 Held Visas</p>

          <div style={css.row3}>
            <div>
              <label style={css.label}>Destination</label>
              <select value={visaDest} onChange={(e) => setVisaDest(e.target.value)} style={css.select}>
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={css.label}>Type</label>
              <select value={visaType} onChange={(e) => setVisaType(e.target.value)} style={css.select}>
                {VISA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={css.label}>Expiry date</label>
              <input type="date" value={visaExpiry} onChange={(e) => setVisaExpiry(e.target.value)} style={css.input} min={new Date().toISOString().split('T')[0]} />
            </div>
            <button
              type="button"
              onClick={handleAddVisa}
              disabled={!visaExpiry}
              style={{ ...css.addBtn, opacity: visaExpiry ? 1 : 0.5, cursor: visaExpiry ? 'pointer' : 'not-allowed' }}
            >
              + Add
            </button>
          </div>

          {profile.visas.length === 0 ? (
            <p style={css.empty}>No visas saved yet.</p>
          ) : (
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Destination</th>
                  <th style={css.th}>Type</th>
                  <th style={css.th}>Expires</th>
                  <th style={css.th}></th>
                </tr>
              </thead>
              <tbody>
                {profile.visas.map((v) => (
                  <tr key={v.id}>
                    <td style={css.td}>{getDestName(v.destinationCountry)}</td>
                    <td style={css.td}>{getVisaLabel(v.visaType)}</td>
                    <td style={css.td}>{v.expiryDate ?? '—'}</td>
                    <td style={css.td}>
                      <button type="button" style={css.removeBtn} onClick={() => persist(removeVisa(profile, v.id))}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Departure country ─────────────────────────────────────────── */}
        <div style={css.card}>
          <p style={css.sectionTitle}>✈️ Departure Country</p>
          <div style={{ maxWidth: 320 }}>
            <label style={css.label}>Where do you fly from?</label>
            <select value={profile.departureCountry} onChange={(e) => handleDeparture(e.target.value)} style={css.select}>
              <option value="">— choose —</option>
              {DESTINATION_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Link href="/search" style={css.searchLink}>
          ✈️ Find Destinations with this profile
        </Link>
      </div>
    </div>
  );
}
