import type { FastifyInstance } from 'fastify';

export async function destinationRoutes(app: FastifyInstance) {
  // GET /v1/destinations — list all destinations
  app.get('/', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'List destinations — coming in Sprint 2',
      },
    });
  });

  // GET /v1/destinations/eligible — filtered by passport + visas + budget
  app.get('/eligible', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Eligible destinations — coming in Sprint 2',
      },
    });
  });

  // GET /v1/destinations/:id
  app.get('/:id', async (_request, reply) => {
    reply.status(501).send({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Destination detail — coming in Sprint 2',
      },
    });
  });
}
