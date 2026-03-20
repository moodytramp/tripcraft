/**
 * Seed script for destination-service.
 * Run with: pnpm --filter @tripcraft/destination-service db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Destinations ────────────────────────────────────────────────────────────

const destinations = [
  {
    countryCode: 'FR',
    countryName: 'France',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Paris',
    imageUrl: 'https://images.unsplash.com/photo-1499856369-1a00bcd0cc3e?w=800',
    avgDailyCostUsd: 120,
    avgTemperature: 13.5,
    safetyRating: 4,
  },
  {
    countryCode: 'JP',
    countryName: 'Japan',
    region: 'Asia',
    currencyCode: 'JPY',
    timezone: 'Asia/Tokyo',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
    avgDailyCostUsd: 100,
    avgTemperature: 15.4,
    safetyRating: 5,
  },
  {
    countryCode: 'ES',
    countryName: 'Spain',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Madrid',
    imageUrl: 'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=800',
    avgDailyCostUsd: 90,
    avgTemperature: 17.2,
    safetyRating: 4,
  },
  {
    countryCode: 'TH',
    countryName: 'Thailand',
    region: 'Asia',
    currencyCode: 'THB',
    timezone: 'Asia/Bangkok',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    avgDailyCostUsd: 45,
    avgTemperature: 28.0,
    safetyRating: 3,
  },
  {
    countryCode: 'MA',
    countryName: 'Morocco',
    region: 'Africa',
    currencyCode: 'MAD',
    timezone: 'Africa/Casablanca',
    imageUrl: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
    avgDailyCostUsd: 55,
    avgTemperature: 19.8,
    safetyRating: 3,
  },
  {
    countryCode: 'IT',
    countryName: 'Italy',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Rome',
    imageUrl: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800',
    avgDailyCostUsd: 110,
    avgTemperature: 15.6,
    safetyRating: 4,
  },
  {
    countryCode: 'PT',
    countryName: 'Portugal',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Lisbon',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    avgDailyCostUsd: 80,
    avgTemperature: 16.9,
    safetyRating: 5,
  },
  {
    countryCode: 'MX',
    countryName: 'Mexico',
    region: 'Americas',
    currencyCode: 'MXN',
    timezone: 'America/Mexico_City',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
    avgDailyCostUsd: 60,
    avgTemperature: 22.1,
    safetyRating: 2,
  },
  {
    countryCode: 'GR',
    countryName: 'Greece',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Athens',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
    avgDailyCostUsd: 85,
    avgTemperature: 18.3,
    safetyRating: 4,
  },
  {
    countryCode: 'VN',
    countryName: 'Vietnam',
    region: 'Asia',
    currencyCode: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    avgDailyCostUsd: 35,
    avgTemperature: 26.5,
    safetyRating: 4,
  },
  {
    countryCode: 'TR',
    countryName: 'Turkey',
    region: 'Europe',
    currencyCode: 'TRY',
    timezone: 'Europe/Istanbul',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
    avgDailyCostUsd: 55,
    avgTemperature: 14.8,
    safetyRating: 3,
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    region: 'Europe',
    currencyCode: 'EUR',
    timezone: 'Europe/Berlin',
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
    avgDailyCostUsd: 115,
    avgTemperature: 9.6,
    safetyRating: 5,
  },
] as const;

// ─── Visa Requirements ────────────────────────────────────────────────────────
// passportCountry = ISO 3166-1 alpha-3 (passport standard)
// destinationCountry = ISO 3166-1 alpha-2

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const expiresAt = new Date(Date.now() + ONE_YEAR);

const visaRequirements = [
  // ── US Passport (USA) ──────────────────────────────────────────────────────
  { passportCountry: 'USA', destinationCountry: 'FR', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'JP', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'ES', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'TH', visaRequired: false, visaOnArrival: true,  eVisaAvailable: false, maxStayDays: 30 },
  { passportCountry: 'USA', destinationCountry: 'MA', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'IT', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'PT', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'MX', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 180 },
  { passportCountry: 'USA', destinationCountry: 'GR', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'VN', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'TR', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90 },
  { passportCountry: 'USA', destinationCountry: 'DE', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },

  // ── UK Passport (GBR) ─────────────────────────────────────────────────────
  { passportCountry: 'GBR', destinationCountry: 'FR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },
  { passportCountry: 'GBR', destinationCountry: 'JP', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'GBR', destinationCountry: 'ES', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },
  { passportCountry: 'GBR', destinationCountry: 'TH', visaRequired: false, visaOnArrival: true,  eVisaAvailable: false, maxStayDays: 30 },
  { passportCountry: 'GBR', destinationCountry: 'MA', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'GBR', destinationCountry: 'IT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },
  { passportCountry: 'GBR', destinationCountry: 'PT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },
  { passportCountry: 'GBR', destinationCountry: 'MX', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 180 },
  { passportCountry: 'GBR', destinationCountry: 'GR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },
  { passportCountry: 'GBR', destinationCountry: 'VN', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 45 },
  { passportCountry: 'GBR', destinationCountry: 'TR', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90 },
  { passportCountry: 'GBR', destinationCountry: 'DE', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90,  notes: 'ETA required post-Brexit' },

  // ── Moroccan Passport (MAR) ───────────────────────────────────────────────
  { passportCountry: 'MAR', destinationCountry: 'FR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'JP', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'ES', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'TH', visaRequired: false, visaOnArrival: true,  eVisaAvailable: false, maxStayDays: 30 },
  { passportCountry: 'MAR', destinationCountry: 'IT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'PT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'MX', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'GR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'VN', visaRequired: true,  visaOnArrival: true,  eVisaAvailable: true,  maxStayDays: 30 },
  { passportCountry: 'MAR', destinationCountry: 'TR', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'MAR', destinationCountry: 'DE', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },

  // ── Indian Passport (IND) ─────────────────────────────────────────────────
  { passportCountry: 'IND', destinationCountry: 'FR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'JP', visaRequired: true,  visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'ES', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'TH', visaRequired: false, visaOnArrival: true,  eVisaAvailable: true,  maxStayDays: 30 },
  { passportCountry: 'IND', destinationCountry: 'MA', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'IT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'PT', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'MX', visaRequired: false, visaOnArrival: false, eVisaAvailable: false, maxStayDays: 180 },
  { passportCountry: 'IND', destinationCountry: 'GR', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'VN', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 90 },
  { passportCountry: 'IND', destinationCountry: 'TR', visaRequired: false, visaOnArrival: false, eVisaAvailable: true,  maxStayDays: 30 },
  { passportCountry: 'IND', destinationCountry: 'DE', visaRequired: true,  visaOnArrival: false, eVisaAvailable: false, maxStayDays: 90 },
] satisfies Array<{
  passportCountry: string;
  destinationCountry: string;
  visaRequired: boolean;
  visaOnArrival: boolean;
  eVisaAvailable: boolean;
  maxStayDays: number;
  notes?: string;
}>;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.warn('🌍  Seeding destination-service database…');

  // Upsert destinations
  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { countryCode: dest.countryCode },
      update: dest,
      create: dest,
    });
  }
  console.warn(`✓  ${destinations.length} destinations upserted`);

  // Upsert visa requirements
  for (const vr of visaRequirements) {
    await prisma.visaRequirement.upsert({
      where: {
        passportCountry_destinationCountry: {
          passportCountry: vr.passportCountry,
          destinationCountry: vr.destinationCountry,
        },
      },
      update: { ...vr, expiresAt },
      create: { ...vr, expiresAt },
    });
  }
  console.warn(`✓  ${visaRequirements.length} visa requirements upserted`);

  console.warn('✅  Seed complete');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
