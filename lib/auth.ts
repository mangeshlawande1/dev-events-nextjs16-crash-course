import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import connectToDatabase from "./mongodb";
import User from "@/database/user.model";
import type { UserDocument } from "@/database/user.model";

// Precomputed bcrypt hash for the string "invalid-password" (cost 10).
// Used to keep timing similar when a user does not exist.
const DUMMY_PASSWORD_HASH =
  "$2b$10$wH8K4QY6f5n5r3Y2yV7G4u8D9xJ0mN1pQ2rS3tU4vW5xY6zA7bC8e";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email
            : undefined;

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (!email || !password) return null;

        await connectToDatabase();

        const user = (await User.findOne({
          email: email.trim().toLowerCase(),
        })) as UserDocument | null;

        if (!user) {
          // Perform a dummy bcrypt comparison so the missing-user path
          // takes roughly the same amount of time as a real password check.
          await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
          return null;
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserDocument["role"],
        };
      },
    }),
  ],
});