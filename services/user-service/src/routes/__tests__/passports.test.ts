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
const MOCK_PASSPORT = {
  id: 'passport-1',
  userId: 'uuid-1',
  countryCode: 'MAR',
  expiryDate: null,
  isPrimary: true,
  documentS3Key: null,
  createdAt: new Date(),
};

describe('GET /v1/users/me/passports', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
    vi.mocked(prisma.passport.findMany).mockResolvedValue([MOCK_PASSPORT]);
  });

  it('returns list of passports', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me/passports' });

    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(1);
    expect(res.json().data[0].countryCode).toBe('MAR');
  });

  it('returns 404 when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me/passports' });

    expect(res.statusCode).toBe(404);
  });
});

describe('POST /v1/users/me/passports', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
    vi.mocked(prisma.passport.updateMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passport.create).mockResolvedValue(MOCK_PASSPORT);
  });

  it('creates a passport and returns 201', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/passports',
      payload: { countryCode: 'MAR', isPrimary: true },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().data.countryCode).toBe('MAR');
  });

  it('returns 400 for invalid country code length', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/passports',
      payload: { countryCode: 'FR' }, // must be 3 chars
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 409 on duplicate passport country', async () => {
    vi.mocked(prisma.passport.create).mockRejectedValue({ code: 'P2002' });
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/users/me/passports',
      payload: { countryCode: 'MAR' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('CONFLICT');
  });
});

describe('DELETE /v1/users/me/passports/:id', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);
  });

  it('deletes a passport and returns 204', async () => {
    vi.mocked(prisma.passport.deleteMany).mockResolvedValue({ count: 1 });
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/v1/users/me/passports/passport-1',
    });

    expect(res.statusCode).toBe(204);
  });

  it('returns 404 when passport not owned by user', async () => {
    vi.mocked(prisma.passport.deleteMany).mockResolvedValue({ count: 0 });
    const app = await buildApp();
    const res = await app.inject({
      method: 'DELETE',
      url: '/v1/users/me/passports/other-passport',
    });

    expect(res.statusCode).toBe(404);
  });
});
