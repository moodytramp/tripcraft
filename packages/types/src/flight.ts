import { z } from 'zod';

export const FlightOfferSchema = z.object({
  id: z.string(),
  provider: z.string(),
  providerOfferId: z.string(),
  airlineCode: z.string().length(2),
  airlineName: z.string(),
  departureAirport: z.string().length(3),
  arrivalAirport: z.string().length(3),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
  stops: z.number().int().min(0),
  priceUsd: z.number().positive(),
  priceCurrency: z.string().length(3),
  priceOriginal: z.number().positive(),
  cabinClass: z.string().optional(),
  isReturn: z.boolean(),
});

export const FlightSearchParamsSchema = z.object({
  origin: z.string().length(3), // IATA airport code
  destination: z.string().length(3),
  departDate: z.string().date(),
  returnDate: z.string().date(),
  travelers: z.number().int().positive().default(1),
  cabinClass: z.enum(['economy', 'business', 'first']).default('economy'),
  sortBy: z.enum(['price', 'duration', 'departure']).default('price'),
});

export type FlightOffer = z.infer<typeof FlightOfferSchema>;
export type FlightSearchParams = z.infer<typeof FlightSearchParamsSchema>;
