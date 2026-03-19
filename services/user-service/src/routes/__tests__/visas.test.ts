import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../server.js';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passport: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
    visa: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock('../../middleware/auth.js', () => ({
  parseAuth: vi.fn().mockImplementation(async (request: { user: unknown }) => {
    request.user = { authProviderId: 'auth0|test-user', email: 'test@example.com' };
  }),
  requireAuth: vi.fn().mockImplementation(async () => {}),
}));

const { prisma } = await import('../../lib/prisma.js');

const MOCK_USER = { id: 'uuid-1', deletedAt: null };
const SCHENGEN_VISA = {
  id: 'visa-1',
  userId: 'uuid-1',
  destinationCountry: 'XX', // XX = Schengen Area convention
  visaType: 'SCHENGEN_C',
  expiryDate: new Date('2027-06-15'),
  documentS3Key: null,
  createdAt: new Date(),
};

describe('GET /v1/users/me/visas', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
    vi.mocked(prisma.visa.findMany).mockResolvedValue([SCHENGEN_VISA]);
  });

  it('returns list of visas', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me/visas' });

    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(1);
    expect(res.json().data[0].visaType).toBe('SCHENGEN_C');
  });

  it('returns 404 when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me/visas' });

    expect(res.statusCode).toBe(404);
  });
});

describe('POST /v1/users/me/visas', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
    vi.mocked(prisma.visa.create).mockResolvedValue(SCHENGEN_VISA);
  });

  it('creates a Schengen visa and returns 201', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/visas',
      payload: {
        destinationCountry: 'XX',
        visaType: 'SCHENGEN_C',
        expiryDate: '2027-06-15',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().data.visaType).toBe('SCHENGEN_C');
  });

  it('returns 400 for country code that is not 2 chars', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/visas',
      payload: { destinationCountry: 'EUR', visaType: 'SCHENGEN_C' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 on duplicate destination visa', async () => {
    vi.mocked(prisma.visa.create).mockRejectedValue({ code: 'P2002' });
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/visas',
      payload: { destinationCountry: 'XX', visaType: 'SCHENGEN_C' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('CONFLICT');
  });
});

describe('DELETE /v1/users/me/visas/:id', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
  });

  it('deletes a visa and returns 204', async () => {
    vi.mocked(prisma.visa.deleteMany).mockResolvedValue({ count: 1 });
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/v1/users/me/visas/visa-1',
    });

    expect(res.statusCode).toBe(204);
  });

  it('returns 404 when visa not owned by user', async () => {
    vi.mocked(prisma.visa.deleteMany).mockResolvedValue({ count: 0 });
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/v1/users/me/visas/other-visa',
    });

    expect(res.statusCode).toBe(404);
  });
});
