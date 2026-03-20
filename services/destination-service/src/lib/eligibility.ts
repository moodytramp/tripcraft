import type { VisaStatus } from '@tripcraft/types';
import { prisma } from './prisma.js';

// Schengen Area member country codes (ISO 3166-1 alpha-2)
export const SCHENGEN_COUNTRIES = new Set([
  'AT', 'BE', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GR', 'HR', 'HU', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT',
  'NL', 'NO', 'PL', 'PT', 'SE', 'SI', 'SK',
]);

// Countries that accept a valid Schengen visa for entry (non-Schengen but Schengen-accepting)
export const SCHENGEN_ACCEPTING_COUNTRIES = new Set([
  'AL', 'BA', 'GE', 'MD', 'ME', 'MK', 'RS', 'UA', // Balkans + Eastern Europe
  'KZ', 'KG', 'TJ', 'UZ',                           // Central Asia
  'CO', 'PE',                                        // Latin America
  'TH', // Some visa-on-arrival programmes accept Schengen
]);

export interface EligibilityInput {
  passportCountries: string[]; // ISO 3166-1 alpha-3, e.g. ['MAR', 'GBR']
  heldVisas: HeldVisa[];
  destinationCountry: string; // ISO 3166-1 alpha-2, e.g. 'FR'
}

export interface HeldVisa {
  destinationCountry: string; // alpha-2 country the visa is for
  expiresAt: Date;
  visaType: string; // e.g. 'schengen', 'tourist', 'work'
}

export interface EligibilityResult {
  visaStatus: VisaStatus;
  visaStatusLabel: string;
  schengenWarning?: string; // e.g. "90/180-day limit: 45 days already used"
}

/**
 * Check if the user holds a valid (non-expired) Schengen visa.
 */
function hasValidSchengenVisa(heldVisas: HeldVisa[], checkDate: Date = new Date()): boolean {
  return heldVisas.some(
    (v) =>
      (SCHENGEN_COUNTRIES.has(v.destinationCountry) || v.visaType.toLowerCase() === 'schengen') &&
      v.expiresAt > checkDate,
  );
}

/**
 * Determine visa eligibility for a single destination.
 * Uses the best passport (most permissive) among all held passports.
 */
export async function checkEligibility(input: EligibilityInput): Promise<EligibilityResult> {
  const { passportCountries, heldVisas, destinationCountry } = input;
  const now = new Date();

  // --- 1. Check if destination is in Schengen Area and user has a valid Schengen visa ---
  if (SCHENGEN_COUNTRIES.has(destinationCountry) && hasValidSchengenVisa(heldVisas, now)) {
    return {
      visaStatus: 'visa-free',
      visaStatusLabel: 'Schengen Visa ✓',
    };
  }

  // --- 2. Check if destination accepts Schengen visa (non-Schengen countries) ---
  if (SCHENGEN_ACCEPTING_COUNTRIES.has(destinationCountry) && hasValidSchengenVisa(heldVisas, now)) {
    return {
      visaStatus: 'visa-free',
      visaStatusLabel: 'Schengen Visa Accepted ✓',
    };
  }

  // --- 3. Check user's held country-specific visas ---
  const heldVisa = heldVisas.find(
    (v) => v.destinationCountry === destinationCountry && v.expiresAt > now,
  );
  if (heldVisa) {
    return {
      visaStatus: 'visa-free',
      visaStatusLabel: 'Visa Held ✓',
    };
  }

  // --- 4. Consult VisaRequirement table for each passport (take best result) ---
  if (passportCountries.length > 0) {
    const requirements = await prisma.visaRequirement.findMany({
      where: {
        passportCountry: { in: passportCountries },
        destinationCountry,
        expiresAt: { gt: now },
      },
    });

    // Score: visa-free > visa-on-arrival > e-visa > visa-required
    let bestStatus: VisaStatus = 'visa-required';
    let bestLabel = 'Visa Required';
    let bestEVisa = false;
    let bestOnArrival = false;

    for (const req of requirements) {
      if (!req.visaRequired) {
        // Visa-free — best possible outcome, stop searching
        return {
          visaStatus: 'visa-free',
          visaStatusLabel: 'Visa-Free ✓',
        };
      }
      if (req.visaOnArrival) {
        bestOnArrival = true;
      }
      if (req.eVisaAvailable) {
        bestEVisa = true;
      }
    }

    if (bestOnArrival) {
      bestStatus = 'visa-on-arrival';
      bestLabel = 'Visa on Arrival';
    } else if (bestEVisa) {
      bestStatus = 'e-visa';
      bestLabel = 'E-Visa Available';
    } else if (requirements.length > 0) {
      bestStatus = 'visa-required';
      bestLabel = 'Visa Required';
    }

    return { visaStatus: bestStatus, visaStatusLabel: bestLabel };
  }

  // --- 5. No passport data — cannot determine ---
  return {
    visaStatus: 'visa-required',
    visaStatusLabel: 'Visa Required',
  };
}

/**
 * Pure (no-DB) eligibility check used in unit tests with pre-fetched requirement data.
 */
export interface VisaRequirementRow {
  passportCountry: string;
  destinationCountry: string;
  visaRequired: boolean;
  visaOnArrival: boolean;
  eVisaAvailable: boolean;
}

export function checkEligibilitySync(
  input: Omit<EligibilityInput, 'destinationCountry'> & { destinationCountry: string },
  requirements: VisaRequirementRow[],
): EligibilityResult {
  const { passportCountries, heldVisas, destinationCountry } = input;
  const now = new Date();

  if (SCHENGEN_COUNTRIES.has(destinationCountry) && hasValidSchengenVisa(heldVisas, now)) {
    return { visaStatus: 'visa-free', visaStatusLabel: 'Schengen Visa ✓' };
  }

  if (SCHENGEN_ACCEPTING_COUNTRIES.has(destinationCountry) && hasValidSchengenVisa(heldVisas, now)) {
    return { visaStatus: 'visa-free', visaStatusLabel: 'Schengen Visa Accepted ✓' };
  }

  const heldVisa = heldVisas.find(
    (v) => v.destinationCountry === destinationCountry && v.expiresAt > now,
  );
  if (heldVisa) {
    return { visaStatus: 'visa-free', visaStatusLabel: 'Visa Held ✓' };
  }

  const matchingReqs = requirements.filter(
    (r) =>
      passportCountries.includes(r.passportCountry) &&
      r.destinationCountry === destinationCountry,
  );

  for (const req of matchingReqs) {
    if (!req.visaRequired) {
      return { visaStatus: 'visa-free', visaStatusLabel: 'Visa-Free ✓' };
    }
  }

  const onArrival = matchingReqs.some((r) => r.visaOnArrival);
  const eVisa = matchingReqs.some((r) => r.eVisaAvailable);

  if (onArrival) return { visaStatus: 'visa-on-arrival', visaStatusLabel: 'Visa on Arrival' };
  if (eVisa) return { visaStatus: 'e-visa', visaStatusLabel: 'E-Visa Available' };
  return { visaStatus: 'visa-required', visaStatusLabel: 'Visa Required' };
}
