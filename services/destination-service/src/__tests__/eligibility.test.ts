import { describe, it, expect } from 'vitest';
import {
  checkEligibilitySync,
  SCHENGEN_COUNTRIES,
  type VisaRequirementRow,
} from '../lib/eligibility.js';
import type { HeldVisa } from '../lib/eligibility.js';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
const PAST_DATE = new Date(Date.now() - 1000);

const moroccanPassport = ['MAR'];
const britishPassport = ['GBR'];
const dualPassport = ['MAR', 'GBR'];
const indianPassport = ['IND'];

const validSchengenVisa: HeldVisa = {
  destinationCountry: 'FR', // France = Schengen
  expiresAt: FUTURE_DATE,
  visaType: 'schengen',
};

const expiredSchengenVisa: HeldVisa = {
  destinationCountry: 'DE',
  expiresAt: PAST_DATE,
  visaType: 'schengen',
};

const usVisaHeld: HeldVisa = {
  destinationCountry: 'US',
  expiresAt: FUTURE_DATE,
  visaType: 'tourist',
};

// Minimal fixture requirements matching our seed data
const fixtureRequirements: VisaRequirementRow[] = [
  // MAR passport
  { passportCountry: 'MAR', destinationCountry: 'TR', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'MAR', destinationCountry: 'MA', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'MAR', destinationCountry: 'MX', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'MAR', destinationCountry: 'TH', visaRequired: true, visaOnArrival: true, eVisaAvailable: false },
  { passportCountry: 'MAR', destinationCountry: 'US', visaRequired: true, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'MAR', destinationCountry: 'JP', visaRequired: true, visaOnArrival: false, eVisaAvailable: true },
  // GBR passport
  { passportCountry: 'GBR', destinationCountry: 'FR', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'GBR', destinationCountry: 'US', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'GBR', destinationCountry: 'JP', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  { passportCountry: 'GBR', destinationCountry: 'TH', visaRequired: false, visaOnArrival: false, eVisaAvailable: false },
  // IND passport
  { passportCountry: 'IND', destinationCountry: 'TH', visaRequired: true, visaOnArrival: true, eVisaAvailable: true },
  { passportCountry: 'IND', destinationCountry: 'JP', visaRequired: true, visaOnArrival: false, eVisaAvailable: true },
  { passportCountry: 'IND', destinationCountry: 'US', visaRequired: true, visaOnArrival: false, eVisaAvailable: false },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkEligibilitySync — Schengen visa logic', () => {
  it('Moroccan passport + valid Schengen visa → visa-free for France (Schengen)', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [validSchengenVisa], destinationCountry: 'FR' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
    expect(result.visaStatusLabel).toContain('Schengen');
  });

  it('Moroccan passport + valid Schengen visa → visa-free for Portugal (Schengen)', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [validSchengenVisa], destinationCountry: 'PT' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('Moroccan passport + expired Schengen visa → visa-required for Germany', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [expiredSchengenVisa], destinationCountry: 'DE' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-required');
  });

  it('Moroccan passport + no Schengen visa → visa-required for Spain', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'ES' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-required');
  });
});

describe('checkEligibilitySync — visa-free passports', () => {
  it('British passport → visa-free for France', () => {
    const result = checkEligibilitySync(
      { passportCountries: britishPassport, heldVisas: [], destinationCountry: 'FR' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('British passport → visa-free for Japan', () => {
    const result = checkEligibilitySync(
      { passportCountries: britishPassport, heldVisas: [], destinationCountry: 'JP' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('British passport → visa-free for USA', () => {
    const result = checkEligibilitySync(
      { passportCountries: britishPassport, heldVisas: [], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('Moroccan passport → visa-free for Turkey (bilateral agreement)', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'TR' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('Moroccan passport → visa-free for Mexico', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'MX' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });
});

describe('checkEligibilitySync — visa-on-arrival', () => {
  it('Moroccan passport → visa-on-arrival for Thailand', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'TH' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-on-arrival');
  });

  it('Indian passport → visa-on-arrival for Thailand', () => {
    const result = checkEligibilitySync(
      { passportCountries: indianPassport, heldVisas: [], destinationCountry: 'TH' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-on-arrival');
  });
});

describe('checkEligibilitySync — e-visa', () => {
  it('Moroccan passport → e-visa for Japan', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'JP' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('e-visa');
  });

  it('Indian passport → e-visa for Japan', () => {
    const result = checkEligibilitySync(
      { passportCountries: indianPassport, heldVisas: [], destinationCountry: 'JP' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('e-visa');
  });
});

describe('checkEligibilitySync — visa-required', () => {
  it('Moroccan passport → visa-required for USA', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-required');
  });

  it('Indian passport → visa-required for USA', () => {
    const result = checkEligibilitySync(
      { passportCountries: indianPassport, heldVisas: [], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-required');
  });
});

describe('checkEligibilitySync — dual passport (best passport wins)', () => {
  it('MAR+GBR dual passport → visa-free for Japan (GBR wins)', () => {
    const result = checkEligibilitySync(
      { passportCountries: dualPassport, heldVisas: [], destinationCountry: 'JP' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('MAR+GBR dual passport → visa-free for USA (GBR wins)', () => {
    const result = checkEligibilitySync(
      { passportCountries: dualPassport, heldVisas: [], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });

  it('MAR+GBR dual passport → visa-free for Thailand (GBR wins)', () => {
    const result = checkEligibilitySync(
      { passportCountries: dualPassport, heldVisas: [], destinationCountry: 'TH' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
  });
});

describe('checkEligibilitySync — held visa overrides', () => {
  it('Moroccan passport + held US visa → visa-free for USA', () => {
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [usVisaHeld], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-free');
    expect(result.visaStatusLabel).toContain('Visa Held');
  });

  it('Moroccan passport + expired US visa → visa-required for USA', () => {
    const expiredUsVisa: HeldVisa = { ...usVisaHeld, expiresAt: PAST_DATE };
    const result = checkEligibilitySync(
      { passportCountries: moroccanPassport, heldVisas: [expiredUsVisa], destinationCountry: 'US' },
      fixtureRequirements,
    );
    expect(result.visaStatus).toBe('visa-required');
  });
});

describe('checkEligibilitySync — Schengen country membership', () => {
  it('Schengen set includes expected members', () => {
    expect(SCHENGEN_COUNTRIES.has('FR')).toBe(true);
    expect(SCHENGEN_COUNTRIES.has('DE')).toBe(true);
    expect(SCHENGEN_COUNTRIES.has('ES')).toBe(true);
    expect(SCHENGEN_COUNTRIES.has('PT')).toBe(true);
    expect(SCHENGEN_COUNTRIES.has('IT')).toBe(true);
  });

  it('Schengen set does NOT include non-members', () => {
    expect(SCHENGEN_COUNTRIES.has('GB')).toBe(false);
    expect(SCHENGEN_COUNTRIES.has('US')).toBe(false);
    expect(SCHENGEN_COUNTRIES.has('TR')).toBe(false);
    expect(SCHENGEN_COUNTRIES.has('MA')).toBe(false);
  });
});
