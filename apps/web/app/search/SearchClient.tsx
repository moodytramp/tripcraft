'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { DestinationCard } from '@tripcraft/ui';
import type { EligibleDestination } from '@tripcraft/types';
import { searchDestinations } from './actions';
import {
  PASSPORT_COUNTRIES,
  DESTINATION_COUNTRIES,
  VISA_TYPES,
  REGIONS,
  SORT_OPTIONS,
} from './constants';

// ── Styles ─────────────────────────────────────────────────────────────────────

const css = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
  },
  hero: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '48px 24px 32px',
    textAlign: 'center' as const,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 800,
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },
  heroSub: {
    fontSize: 18,
    opacity: 0.85,
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 12,
  },
  label: {
    display: 'block' as const,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 15,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    outline: 'none',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 15,
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    outline: 'none',
  },
  row: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  field: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  passportPills: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 12,
  },
  pill: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: '#eff6ff',
    color: 'var(--color-primary)',
    border: '1px solid #bfdbfe',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 13,
    fontWeight: 600,
  },
  pillRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-primary)',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    display: 'flex' as const,
    alignItems: 'center' as const,
  },
  addBtn: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 6,
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px dashed var(--color-primary)',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
  visaRow: {
    display: 'grid' as const,
    gridTemplateColumns: '2fr 1.5fr 1.5fr auto',
    gap: 8,
    alignItems: 'end' as const,
    marginBottom: 8,
  },
  removeBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    padding: '10px 12px',
    fontSize: 16,
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  resultsHeader: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    marginTop: 32,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 700,
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: 'var(--color-primary)',
    border: '1px solid #bfdbfe',
    borderRadius: 999,
    padding: '4px 14px',
    fontSize: 14,
    fontWeight: 600,
  },
  grid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    marginBottom: 48,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '64px 24px',
    color: 'var(--color-text-secondary)',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 8,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: 14,
    marginTop: 16,
  },
  filterRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  spinnerWrap: {
    textAlign: 'center' as const,
    padding: '64px 24px',
    color: 'var(--color-text-secondary)',
    fontSize: 16,
  },
} as const;

// ── Visa entry type ───────────────────────────────────────────────────────────

interface VisaEntry {
  id: number;
  destinationCountry: string;
  expiresAt: string;
  visaType: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SearchClient() {
  // Passport state
  const [passportInput, setPassportInput] = useState('');
  const [passports, setPassports] = useState<string[]>([]);

  // Visa state
  const [visas, setVisas] = useState<VisaEntry[]>([]);
  const [nextVisaId, setNextVisaId] = useState(1);

  // Filter state
  const [budgetUsd, setBudgetUsd] = useState('');
  const [region, setRegion] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'safety' | 'temperature'>('price');

  // Results state
  const [results, setResults] = useState<EligibleDestination[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Passport handlers ────────────────────────────────────────────────────────

  const addPassport = useCallback(() => {
    if (passportInput && !passports.includes(passportInput)) {
      setPassports((prev) => [...prev, passportInput]);
    }
    setPassportInput('');
  }, [passportInput, passports]);

  const removePassport = useCallback((code: string) => {
    setPassports((prev) => prev.filter((p) => p !== code));
  }, []);

  const getPassportName = (code: string) =>
    PASSPORT_COUNTRIES.find((c) => c.code === code)?.name ?? code;

  // ── Visa handlers ─────────────────────────────────────────────────────────────

  const addVisa = useCallback(() => {
    setVisas((prev) => [
      ...prev,
      { id: nextVisaId, destinationCountry: 'FR', expiresAt: '', visaType: 'schengen' },
    ]);
    setNextVisaId((n) => n + 1);
  }, [nextVisaId]);

  const updateVisa = useCallback((id: number, field: keyof Omit<VisaEntry, 'id'>, value: string) => {
    setVisas((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }, []);

  const removeVisa = useCallback((id: number) => {
    setVisas((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // ── Search handler ────────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const res = await searchDestinations({
        passportCountries: passports,
        visas: visas
          .filter((v) => v.destinationCountry && v.expiresAt)
          .map((v) => ({
            destinationCountry: v.destinationCountry,
            expiresAt: v.expiresAt,
            visaType: v.visaType,
          })),
        budgetUsd: budgetUsd ? Number(budgetUsd) : undefined,
        region: region || undefined,
        sortBy,
      });

      if (res.error) {
        setError(res.error);
        setResults(null);
      } else {
        setResults(res.destinations);
      }
    });
  }, [passports, visas, budgetUsd, region, sortBy]);

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <div style={css.page}>
      {/* Hero */}
      <div style={css.hero}>
        <h1 style={css.heroTitle}>Find Your Next Trip</h1>
        <p style={css.heroSub}>
          Enter your passport & visas — see every destination you can reach today
        </p>
      </div>

      <div style={css.container}>
        <div style={{ marginTop: 32 }}>

          {/* ── Passports ─────────────────────────────────────────────────── */}
          <div style={css.card}>
            <p style={css.sectionTitle}>🛂 Your Passports</p>
            <div style={css.row}>
              <div style={css.field}>
                <label htmlFor="passport-select" style={css.label}>
                  Select passport nationality
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    id="passport-select"
                    value={passportInput}
                    onChange={(e) => setPassportInput(e.target.value)}
                    style={{ ...css.select, flex: 1 }}
                  >
                    <option value="">— choose country —</option>
                    {PASSPORT_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} disabled={passports.includes(c.code)}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addPassport}
                    disabled={!passportInput || passports.includes(passportInput)}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: passportInput ? 'pointer' : 'not-allowed',
                      opacity: passportInput ? 1 : 0.5,
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {passports.length > 0 && (
              <div style={css.passportPills}>
                {passports.map((code) => (
                  <span key={code} style={css.pill}>
                    {getPassportName(code)} ({code})
                    <button
                      type="button"
                      onClick={() => removePassport(code)}
                      style={css.pillRemove}
                      aria-label={`Remove ${code} passport`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Held Visas ────────────────────────────────────────────────── */}
          <div style={css.card}>
            <p style={css.sectionTitle}>📄 Held Visas <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--color-text-secondary)' }}>(optional)</span></p>

            {visas.map((visa) => (
              <div key={visa.id} style={css.visaRow}>
                <div style={css.field}>
                  <label style={css.label}>Destination</label>
                  <select
                    value={visa.destinationCountry}
                    onChange={(e) => updateVisa(visa.id, 'destinationCountry', e.target.value)}
                    style={css.select}
                  >
                    {DESTINATION_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={css.field}>
                  <label style={css.label}>Type</label>
                  <select
                    value={visa.visaType}
                    onChange={(e) => updateVisa(visa.id, 'visaType', e.target.value)}
                    style={css.select}
                  >
                    {VISA_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div style={css.field}>
                  <label style={css.label}>Expires</label>
                  <input
                    type="date"
                    value={visa.expiresAt}
                    onChange={(e) => updateVisa(visa.id, 'expiresAt', e.target.value)}
                    style={css.input}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVisa(visa.id)}
                  style={css.removeBtn}
                  aria-label="Remove visa"
                >
                  ×
                </button>
              </div>
            ))}

            <button type="button" onClick={addVisa} style={css.addBtn}>
              + Add a visa
            </button>
          </div>

          {/* ── Filters ───────────────────────────────────────────────────── */}
          <div style={css.card}>
            <p style={css.sectionTitle}>🔍 Filters</p>
            <div style={css.filterRow}>
              <div style={css.field}>
                <label htmlFor="budget" style={css.label}>
                  Max daily budget (USD)
                </label>
                <input
                  id="budget"
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="e.g. 150"
                  value={budgetUsd}
                  onChange={(e) => setBudgetUsd(e.target.value)}
                  style={css.input}
                />
              </div>
              <div style={css.field}>
                <label htmlFor="region" style={css.label}>Region</label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={css.select}
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={css.field}>
                <label htmlFor="sort" style={css.label}>Sort by</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  style={css.select}
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Submit ────────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={passports.length === 0 || isPending}
            style={{
              ...css.submitBtn,
              ...(passports.length === 0 || isPending ? css.submitBtnDisabled : {}),
            }}
          >
            {isPending ? 'Searching…' : '✈️  Find Eligible Destinations'}
          </button>

          {error && <div style={css.errorBanner}>⚠️ {error}</div>}
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {isPending && (
          <div style={css.spinnerWrap}>
            <p>Finding destinations…</p>
          </div>
        )}

        {!isPending && results !== null && (
          <>
            <div style={css.resultsHeader}>
              <h2 style={css.resultsTitle}>
                {results.length > 0 ? 'Eligible Destinations' : 'No Results'}
              </h2>
              {results.length > 0 && (
                <span style={css.badge}>{results.length} destinations</span>
              )}
            </div>

            {results.length === 0 ? (
              <div style={css.emptyState}>
                <div style={css.emptyIcon}>🌍</div>
                <p style={css.emptyTitle}>No destinations match your criteria</p>
                <p>Try removing the budget filter or selecting a different region.</p>
              </div>
            ) : (
              <div style={css.grid}>
                {results.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onPress={(_d) => {
                      // TODO Sprint 4: navigate to destination detail page
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
