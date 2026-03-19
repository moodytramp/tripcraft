import type { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  // GET /v1/users/me
  app.get('/me', async (_request, reply) => {
    // TODO: Implement in Sprint 1 — auth middleware + DB query
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'User profile endpoint — coming in Sprint 1',
      },
    });
  });

  // PUT /v1/users/me
  app.put('/me', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Update profile endpoint — coming in Sprint 1',
      },
    });
  });

  // DELETE /v1/users/me (GDPR deletion)
  app.delete('/me', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Account deletion endpoint — coming in Sprint 1',
      },
    });
  });
}
