import { type Response, type Request } from "express";
import type { AuthenticateRequest } from "../middlewares/authMiddleware.js";
import zod from "zod";
import { prisma } from "../config/prisma.js";

export const createBooking = async (
  req: AuthenticateRequest,
  res: Response,
) => {
  try {
    // Get the userId we have to use the usrId as playerId
    if (!req.user || typeof req.user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // create the zod schema to validate the request body
    const createBookingSchema = zod.object({
      courtId: zod.cuid2(),
      date: zod.coerce.date(),
      startTime: zod.coerce.date(),
      endTime: zod.coerce.date(),
    });

    // Validate those with zod
    const validationResult = createBookingSchema.safeParse(req.body);

    // If the validation fails, return a 422 error with the validation errors
    if (!validationResult.success) {
      return res.status(422).json(zod.treeifyError(validationResult.error));
    }

    const { date, startTime, endTime, courtId } = validationResult.data;

    // Check if the startTime is in the future
    const now = new Date();
    if (startTime < now) {
      return res.status(400).json({ error: "Cannot book a time in the past" });
    }

    // validate the chosen hours (1hrs min & 4hrs max) and should be in the multiple of 1hrs
    const durationInHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationInHours < 1 || durationInHours > 4) {
      return res
        .status(422)
        .json({ error: "Booking duration must be between 1 and 4 hours" });
    }

    if (durationInHours % 1 !== 0) {
      return res
        .status(422)
        .json({ error: "Booking duration must be in multiples of 1 hour" });
    }

    // Get the userId from the request object
    const playerId = req.user.userId;

    // Check if the court is available for the chosen date and time
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        courtId: courtId,
        date: date,

        // Overlap Conditions
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    if (overlappingBookings.length > 0) {
      return res
        .status(409)
        .json({ error: "The court is not available for the chosen time slot" });
    }

    // Calculate the total amount for the booking
    const court = await prisma.court.findUnique({
      where: {
        id: courtId,
      },
    });

    if (!court) {
      return res.status(404).json({ error: "Court not found" });
    }

    const totalAmount = durationInHours * court.pricePerHour;

    // If the court is available, create the booking
    const booking = await prisma.booking.create({
      data: {
        playerId,
        courtId,
        date,
        startTime,
        endTime,
        totalAmount,
      },
    });
    return res.status(201).json(booking);
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    // 1. Create the Zod schema for req.query
    const availabilityQuerySchema = zod.object({
      courtId: zod.cuid2(),
      date: zod.coerce.date(),
    });

    // 2. Validate req.query using safeParse

    const validationResult = availabilityQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(422).json(zod.treeifyError(validationResult.error));
    }

    // 3. Extract validated data
    const { courtId, date } = validationResult.data;

    const startOfDay = new Date(date);
    console.log(startOfDay);

    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    console.log(endOfDay);

    endOfDay.setUTCHours(23, 59, 59, 999);

    // 4. Database Query
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: courtId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // 5. Return the data (අපි මේක ඊළඟට ලියමු)
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBookingsByPlayerId = async (
  req: AuthenticateRequest,
  res: Response,
) => {
  try {
    // Get the playerId as userId from the request object
    if (!req.user || typeof req.user === "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.user as { userId: string };

    // Fetch the bookings from the database using prisma sorted in the descending order of the createdAt field and include the court details in the response
    const bookings = await prisma.booking.findMany({
      where: {
        playerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        totalAmount: true,

        court: {
          select: {
            id: true,
            name: true,

            arena: {
              select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    // Return the bookings in the response
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
