import { NextRequest } from "next/server";
import { z } from "zod";

import connectToDatabase from "@/lib/mongodb";
import User from "@/database/user.model";
import { registerSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return apiError("Invalid registration data", 400, {
        errors: z.treeifyError(result.error),
      });
    }

    const { name, email, password, role } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return apiError("An account with this email already exists.", 409);
    }

    // Password is hashed by the User model's pre-save hook - never
    // hashed/stored here directly.
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    });

    return apiSuccess(
      "Account created successfully",
      { userId: user._id.toString() },
      201
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError("An account with this email already exists.", 409);
    }

    console.error("Registration failed:", error);
    return apiError("Registration failed", 500);
  }
}
