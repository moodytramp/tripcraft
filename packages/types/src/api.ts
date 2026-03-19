import { z } from 'zod';

export const PaginationSchema = z.object({
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const MetaSchema = z.object({
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
  pagination: PaginationSchema.optional(),
});

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: MetaSchema,
  });

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      'VALIDATION_ERROR',
      'NOT_FOUND',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'EXTERNAL_API_FAILURE',
      'RATE_LIMITED',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
  meta: MetaSchema,
});

export type Pagination = z.infer<typeof PaginationSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
