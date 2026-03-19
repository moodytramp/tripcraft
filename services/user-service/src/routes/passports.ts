import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const CreatePassportSchema = z.object({
  // ISO 3166-1 alpha-3 (e.g. "MAR" for Morocco)
  countryCode: z.string().length(3).toUpperCase(),
  expiryDate: z.string().date().optional(),
  isPrimary: z.boolean().optional().default(false),
});

async function resolveUserId(authProviderId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { authProviderId },
    select: { id: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return null;
  return user.id;
}

export async function passportRoutes(app: FastifyInstance) {
  // GET /v1/users/me/passports
  app.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const passports = await prisma.passport.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return reply.send({ data: passports });
  });

  // POST /v1/users/me/passports
  app.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const result = CreatePassportSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.message },
      });
    }

    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const { countryCode, expiryDate, isPrimary } = result.data;

    // If this is set as primary, clear existing primary flag first
    if (isPrimary) {
      await prisma.passport.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    try {
      const passport = await prisma.passport.create({
        data: {
          userId,
          countryCode,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
          isPrimary: isPrimary ?? false,
        },
      });
      return reply.status(201).send({ data: passport });
    } catch (err: unknown) {
      // Unique constraint: user already has this passport country
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return reply.status(409).send({
          error: { code: 'CONFLICT', message: `Passport for ${countryCode} already exists.` },
        });
      }
      throw err;
    }
  });

  // DELETE /v1/users/me/passports/:id
  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const { count } = await prisma.passport.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Passport not found.' },
      });
    }

    return reply.status(204).send();
  });
}
