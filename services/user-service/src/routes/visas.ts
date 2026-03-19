import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const CreateVisaSchema = z.object({
  // ISO 3166-1 alpha-2 destination country, or "XX" for Schengen Area
  destinationCountry: z.string().length(2).toUpperCase(),
  visaType: z.string().min(1).max(50),
  expiryDate: z.string().date().optional(),
});

async function resolveUserId(authProviderId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { authProviderId },
    select: { id: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return null;
  return user.id;
}

export async function visaRoutes(app: FastifyInstance) {
  // GET /v1/users/me/visas
  app.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const visas = await prisma.visa.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send({ data: visas });
  });

  // POST /v1/users/me/visas
  app.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const result = CreateVisaSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.message },
      });
    }

    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const { destinationCountry, visaType, expiryDate } = result.data;

    try {
      const visa = await prisma.visa.create({
        data: {
          userId,
          destinationCountry,
          visaType,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        },
      });
      return reply.status(201).send({ data: visa });
    } catch (err: unknown) {
      // Unique constraint: user already has a visa for this destination
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        return reply.status(409).send({
          error: {
            code: 'CONFLICT',
            message: `A visa for ${destinationCountry} already exists. Delete it first to update.`,
          },
        });
      }
      throw err;
    }
  });

  // DELETE /v1/users/me/visas/:id
  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = await resolveUserId(request.user!.authProviderId);
    if (!userId) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    const { count } = await prisma.visa.deleteMany({
      where: { id, userId },
    });

    if (count === 0) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Visa not found.' },
      });
    }

    return reply.status(204).send();
  });
}
