import type { FastifyInstance } from 'fastify';

export async function passportRoutes(app: FastifyInstance) {
  // POST /v1/users/me/passports
  app.post('/', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Add passport endpoint — coming in Sprint 1',
      },
    });
  });

  // DELETE /v1/users/me/passports/:id
  app.delete('/:id', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Remove passport endpoint — coming in Sprint 1',
      },
    });
  });
}
