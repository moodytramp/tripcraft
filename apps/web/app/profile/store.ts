'use client';

// ---------------------------------------------------------------------------
// Local profile store — persists passports + visas to localStorage.
// Shape mirrors the user-service API so this can be replaced with real API
// calls once Auth0 is configured.
// ---------------------------------------------------------------------------

export interface SavedPassport {
  id: string;
  countryCode: string; // alpha-3
  expiryDate: string | null;
  isPrimary: boolean;
}

export interface SavedVisa {
  id: string;
  destinationCountry: string; // alpha-2
  visaType: string;
  expiryDate: string | null;
}

export interface LocalProfile {
  passports: SavedPassport[];
  visas: SavedVisa[];
  departureCountry: string; // alpha-2
}

const STORAGE_KEY = 'tripcraft:profile';

function defaultProfile(): LocalProfile {
  return { passports: [], visas: [], departureCountry: '' };
}

export function loadProfile(): LocalProfile {
  if (typeof window === 'undefined') return defaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalProfile) : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile: LocalProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function addPassport(profile: LocalProfile, passport: Omit<SavedPassport, 'id'>): LocalProfile {
  // Max 3 passports
  if (profile.passports.length >= 3) return profile;
  // Deduplicate by countryCode
  if (profile.passports.some((p) => p.countryCode === passport.countryCode)) return profile;
  const newPassport = { ...passport, id: uid() };
  const passports = passport.isPrimary
    ? [...profile.passports.map((p) => ({ ...p, isPrimary: false })), newPassport]
    : [...profile.passports, newPassport];
  return { ...profile, passports };
}

export function removePassport(profile: LocalProfile, id: string): LocalProfile {
  return { ...profile, passports: profile.passports.filter((p) => p.id !== id) };
}

export function addVisa(profile: LocalProfile, visa: Omit<SavedVisa, 'id'>): LocalProfile {
  // Deduplicate by destinationCountry
  if (profile.visas.some((v) => v.destinationCountry === visa.destinationCountry)) return profile;
  return { ...profile, visas: [...profile.visas, { ...visa, id: uid() }] };
}

export function removeVisa(profile: LocalProfile, id: string): LocalProfile {
  return { ...profile, visas: profile.visas.filter((v) => v.id !== id) };
}
