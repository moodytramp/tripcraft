import { z } from 'zod';

export const HotelOfferSchema = z.object({
  id: z.string(),
  provider: z.string(),
  providerHotelId: z.string(),
  hotelName: z.string(),
  starRating: z.number().int().min(1).max(5).nullable(),
  address: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  pricePerNightUsd: z.number().positive(),
  totalPriceUsd: z.number().positive(),
  priceCurrency: z.string().length(3),
  guestScore: z.number().min(0).max(10).nullable(),
  distanceToCenterKm: z.number().positive().nullable(),
  amenities: z.array(z.string()),
});

export const HotelSearchParamsSchema = z.object({
  destination: z.string(), // city or IATA code
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guests: z.number().int().positive().default(1),
  maxPricePerNightUsd: z.number().positive().optional(),
  minStars: z.number().int().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  sortBy: z.enum(['price', 'rating', 'distance']).default('price'),
});

export type HotelOffer = z.infer<typeof HotelOfferSchema>;
export type HotelSearchParams = z.infer<typeof HotelSearchParamsSchema>;
