import { z } from 'zod';
import { FlightOfferSchema } from './flight.js';
import { HotelOfferSchema } from './hotel.js';

export const TripStatusEnum = z.enum(['draft', 'saved', 'shared', 'archived']);

export const TripSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  destinationId: z.string().uuid(),
  status: TripStatusEnum.default('draft'),
  departureCountry: z.string().length(2),
  budgetUsd: z.number().positive().nullable(),
  travelerCount: z.number().int().positive().default(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  totalCostUsd: z.number().positive().nullable(),
  shareToken: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TripDetailSchema = TripSchema.extend({
  selectedFlight: FlightOfferSchema.nullable(),
  selectedHotel: HotelOfferSchema.nullable(),
  costBreakdown: z.object({
    flightCost: z.number().min(0),
    hotelCost: z.number().min(0),
    estimatedTaxes: z.number().min(0),
    totalCost: z.number().min(0),
    remainingBudget: z.number().nullable(),
  }),
});

export const CreateTripSchema = z.object({
  destinationId: z.string().uuid(),
  departureCountry: z.string().length(2),
  budgetUsd: z.number().positive().optional(),
  travelerCount: z.number().int().positive().default(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export type TripStatus = z.infer<typeof TripStatusEnum>;
export type Trip = z.infer<typeof TripSchema>;
export type TripDetail = z.infer<typeof TripDetailSchema>;
export type CreateTrip = z.infer<typeof CreateTripSchema>;
