import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { checkEligibility } from '../lib/eligibility.js';
import type { HeldVisa } from '../lib/eligibility.js';

// ── Query param schemas ────────────────────────────────────────────────────────

const EligibleQuerySchema = z.object({
  passportCountries: z
    .string()
    .transform((v) => v.split(',').map((s) => s.trim().toUpperCase()))
    .pipe(z.array(z.string().length(3))),
  // Comma-separated list of "CC:YYYY-MM-DD:type" — country(alpha-2):expiresAt:visaType
  visas: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return [] as HeldVisa[];
      return v.split(',').map((entry) => {
        const [destinationCountry, expiresAt, visaType = 'tourist'] = entry.split(':');
        return {
          destinationCountry: (destinationCountry ?? '').toUpperCase(),
          expiresAt: new Date(expiresAt ?? ''),
          visaType,
        } satisfies HeldVisa;
      });
    }),
  budgetUsd: z.coerce.number().positive().optional(),
  region: z.string().optional(),
  sortBy: z.enum(['price', 'safety', 'temperature']).default('price'),
});

const DestinationParamsSchema = z.object({
  id: z.string().uuid(),
});

// ── Helper ─────────────────────────────────────────────────────────────────────

function toNumber(d: unknown): number | null {
  if (d === null || d === undefined) return null;
  const n = Number(d);
  return isNaN(n) ? null : n;
}

// ── Routes ─────────────────────────────────────────────────────────────────────

export async function destinationRoutes(app: FastifyInstance) {
  // ── GET /v1/destinations ────────────────────────────────────────────────────
  app.get('/', async (_request, reply) => {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { countryName: 'asc' },
      select: {
        id: true,
        countryCode: true,
        countryName: true,
        region: true,
        currencyCode: true,
        timezone: true,
        imageUrl: true,
        avgDailyCostUsd: true,
        avgTemperature: true,
        safetyRating: true,
        isActive: true,
      },
    });

    return reply.send(
      destinations.map((d) => ({
        ...d,
        avgDailyCostUsd: toNumber(d.avgDailyCostUsd),
        avgTemperature: toNumber(d.avgTemperature),
      })),
    );
  });

  // ── GET /v1/destinations/eligible ──────────────────────────────────────────
  app.get('/eligible', async (request, reply) => {
    const parseResult = EligibleQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
    }

    const { passportCountries, visas: heldVisas, budgetUsd, region, sortBy } = parseResult.data;

    // Fetch active destinations
    const destinations = await prisma.destination.findMany({
      where: {
        isActive: true,
        ...(region ? { region } : {}),
      },
      orderBy: { countryName: 'asc' },
    });

    // Run eligibility checks in parallel
    const results = await Promise.all(
      destinations.map(async (dest) => {
        const eligibility = await checkEligibility({
          passportCountries,
          heldVisas,
          destinationCountry: dest.countryCode,
        });

        return {
          id: dest.id,
          countryCode: dest.countryCode,
          countryName: dest.countryName,
          region: dest.region,
          currencyCode: dest.currencyCode,
          timezone: dest.timezone,
          imageUrl: dest.imageUrl,
          avgDailyCostUsd: toNumber(dest.avgDailyCostUsd),
          avgTemperature: toNumber(dest.avgTemperature),
          safetyRating: dest.safetyRating,
          isActive: dest.isActive,
          visaStatus: eligibility.visaStatus,
          visaStatusLabel: eligibility.visaStatusLabel,
          estimatedMinCostUsd: toNumber(dest.avgDailyCostUsd),
          schengenWarning: eligibility.schengenWarning,
        };
      }),
    );

    // Filter out visa-required destinations
    let eligible = results.filter((r) => r.visaStatus !== 'visa-required');

    // Filter by budget (avgDailyCostUsd as a proxy for trip affordability)
    if (budgetUsd !== undefined) {
      eligible = eligible.filter(
        (r) => r.avgDailyCostUsd === null || r.avgDailyCostUsd <= budgetUsd,
      );
    }

    // Sort
    if (sortBy === 'price') {
      eligible.sort((a, b) => {
        if (a.avgDailyCostUsd === null) return 1;
        if (b.avgDailyCostUsd === null) return -1;
        return a.avgDailyCostUsd - b.avgDailyCostUsd;
      });
    } else if (sortBy === 'safety') {
      eligible.sort((a, b) => {
        if (a.safetyRating === null) return 1;
        if (b.safetyRating === null) return -1;
        return b.safetyRating - a.safetyRating;
      });
    } else if (sortBy === 'temperature') {
      eligible.sort((a, b) => {
        if (a.avgTemperature === null) return 1;
        if (b.avgTemperature === null) return -1;
        return b.avgTemperature - a.avgTemperature;
      });
    }

    return reply.send(eligible);
  });

  // ── GET /v1/destinations/:id ────────────────────────────────────────────────
  app.get('/:id', async (request, reply) => {
    const parseResult = DestinationParamsSchema.safeParse(request.params);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid destination id' },
      });
    }

    const destination = await prisma.destination.findUnique({
      where: { id: parseResult.data.id },
    });

    if (!destination || !destination.isActive) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Destination not found' },
      });
    }

    return reply.send({
      ...destination,
      avgDailyCostUsd: toNumber(destination.avgDailyCostUsd),
      avgTemperature: toNumber(destination.avgTemperature),
    });
  });
}
