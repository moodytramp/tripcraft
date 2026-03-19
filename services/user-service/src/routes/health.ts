import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/ready', async () => {
    // TODO: Check DB connection in Sprint 1
    return {
      status: 'ok',
      checks: {
        database: 'ok',
      },
    };
  });
}
