import * as z from "zod";

export const bookingSchema = z.object({
    tour: z.string({
        error: "Please select a tour.",
    }),
    date: z.date({
        error: "Please select a date.",
    }),
    adults: z.coerce.number().min(1, "At least 1 adult is required."),
    children: z.coerce.number().optional().default(0),
    seniors: z.coerce.number().optional().default(0),
    addTransfer: z.boolean().optional(),
    addKayak: z.boolean().optional(),
    addFerry: z.boolean().optional(),
    addExtraDay: z.boolean().optional(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(8, "Please enter a valid phone number (including country code)."),
    specialRequests: z.string().optional(),
});

export type BookingValues = z.infer<typeof bookingSchema>;
