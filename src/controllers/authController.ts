import { type Request, type Response } from "express";
import zod from "zod";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Extract user details from the request body
    const { name, email, password, role } = req.body;

    // Validate user input with zod
    const registerUserSchema = zod.object({
      name: zod.string().min(1, "Name is required"),
      email: zod.string().email("Invalid email address"),
      password: zod
        .string()
        .min(6, "Password must be at least 6 characters long"),
      role: zod.enum(["OWNER", "PLAYER"]).optional(),
    });

    const validationResult = registerUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(422).json(zod.treeifyError(validationResult.error));
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validationResult.data.email,
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(
      validationResult.data.password,
      10,
    );

    // Create the user in the database with Prisma
    const newUser = await prisma.user.create({
      data: {
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: hashedPassword,
        ...(validationResult.data.role
          ? { role: validationResult.data.role }
          : {}),
      },
    });

    // Respond with success message and user details (excluding password)
    res.status(201).json({
      message: "User registered successfully",
      newUser: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
