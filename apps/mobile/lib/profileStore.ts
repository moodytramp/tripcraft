import * as SecureStore from 'expo-secure-store';

// ---------------------------------------------------------------------------
// Mobile profile store — persists passports + visas via expo-secure-store.
// Shape mirrors the web localStorage store and the user-service API.
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

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function loadProfile(): Promise<LocalProfile> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalProfile) : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export async function saveProfile(profile: LocalProfile): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(profile));
}

export function addPassport(
  profile: LocalProfile,
  passport: Omit<SavedPassport, 'id'>,
): LocalProfile {
  if (profile.passports.length >= 3) return profile;
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
  if (profile.visas.some((v) => v.destinationCountry === visa.destinationCountry)) return profile;
  return { ...profile, visas: [...profile.visas, { ...visa, id: uid() }] };
}

export function removeVisa(profile: LocalProfile, id: string): LocalProfile {
  return { ...profile, visas: profile.visas.filter((v) => v.id !== id) };
}
