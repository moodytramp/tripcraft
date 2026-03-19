import { z } from 'zod';

export const VisaStatusEnum = z.enum(['visa-free', 'visa-on-arrival', 'e-visa', 'visa-required']);

export const DestinationSchema = z.object({
  id: z.string().uuid(),
  countryCode: z.string().length(2),
  countryName: z.string(),
  region: z.string(),
  currencyCode: z.string().length(3),
  timezone: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  avgDailyCostUsd: z.number().positive().nullable(),
  safetyRating: z.number().min(1).max(5).nullable(),
  isActive: z.boolean().default(true),
});

export const EligibleDestinationSchema = DestinationSchema.extend({
  visaStatus: VisaStatusEnum,
  visaStatusLabel: z.string(), // e.g., "Visa-Free ✓", "Schengen Visa ✓"
  estimatedMinCostUsd: z.number().positive().nullable(),
  avgTemperature: z.number().nullable(),
});

export const DestinationFilterSchema = z.object({
  passportCountries: z.array(z.string().length(3)).min(1),
  visaCountries: z.array(z.string().length(2)).optional(),
  budgetUsd: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  travelPeriod: z.string().optional(),
  region: z.string().optional(),
  visaStatus: VisaStatusEnum.optional(),
  sortBy: z.enum(['price', 'popularity', 'travel-time']).default('price'),
});

export type VisaStatus = z.infer<typeof VisaStatusEnum>;
export type Destination = z.infer<typeof DestinationSchema>;
export type EligibleDestination = z.infer<typeof EligibleDestinationSchema>;
export type DestinationFilter = z.infer<typeof DestinationFilterSchema>;
