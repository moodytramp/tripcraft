import type { FastifyInstance } from 'fastify';

export async function visaRoutes(app: FastifyInstance) {
  // POST /v1/users/me/visas
  app.post('/', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Add visa endpoint — coming in Sprint 1',
      },
    });
  });

  // DELETE /v1/users/me/visas/:id
  app.delete('/:id', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Remove visa endpoint — coming in Sprint 1',
      },
    });
  });
}
