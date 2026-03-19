import { z } from 'zod';

export const PassportSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  countryCode: z.string().length(3), // ISO 3166-1 alpha-3
  expiryDate: z.string().date().nullable(),
  isPrimary: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export const VisaSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  destinationCountry: z.string().length(2), // ISO 3166-1 alpha-2
  visaType: z.string().max(50),
  expiryDate: z.string().date().nullable(),
  createdAt: z.string().datetime(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  departureCountry: z.string().length(2).nullable(),
  preferredLanguage: z.enum(['en', 'fr', 'es', 'de', 'ar']).default('en'),
  preferredCurrency: z.string().length(3).default('USD'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePassportSchema = PassportSchema.pick({
  countryCode: true,
  expiryDate: true,
  isPrimary: true,
});

export const CreateVisaSchema = VisaSchema.pick({
  destinationCountry: true,
  visaType: true,
  expiryDate: true,
});

export const UpdateUserSchema = UserSchema.pick({
  displayName: true,
  departureCountry: true,
  preferredLanguage: true,
  preferredCurrency: true,
}).partial();

export type Passport = z.infer<typeof PassportSchema>;
export type Visa = z.infer<typeof VisaSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreatePassport = z.infer<typeof CreatePassportSchema>;
export type CreateVisa = z.infer<typeof CreateVisaSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
