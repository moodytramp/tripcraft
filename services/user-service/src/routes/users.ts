import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const UpdateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  departureCountry: z.string().length(2).toUpperCase().optional(),
  preferredLanguage: z.enum(['en', 'fr', 'es', 'de', 'ar']).optional(),
  preferredCurrency: z.string().length(3).toUpperCase().optional(),
});

/**
 * Upserts a user row by authProviderId. Called on every authenticated profile access
 * so the first request auto-provisions the account.
 */
async function getOrCreateUser(authProviderId: string, email: string) {
  return prisma.user.upsert({
    where: { authProviderId },
    create: {
      authProviderId,
      email,
      displayName: email.split('@')[0] ?? 'Traveler',
    },
    update: {},
  });
}

export async function userRoutes(app: FastifyInstance) {
  // GET /v1/users/me
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = await getOrCreateUser(request.user!.authProviderId, request.user!.email);

    if (user.deletedAt) {
      return reply.status(410).send({
        error: { code: 'ACCOUNT_DELETED', message: 'This account has been deleted.' },
      });
    }

    return reply.send({ data: user });
  });

  // PUT /v1/users/me
  app.put('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const result = UpdateUserSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: result.error.message },
      });
    }

    const user = await prisma.user.findUnique({
      where: { authProviderId: request.user!.authProviderId },
    });

    if (!user || user.deletedAt) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: result.data,
    });

    return reply.send({ data: updated });
  });

  // DELETE /v1/users/me — soft delete (GDPR)
  app.delete('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { authProviderId: request.user!.authProviderId },
    });

    if (!user || user.deletedAt) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });

    return reply.status(204).send();
  });
}
