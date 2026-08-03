import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "./auth.config";
import connectToDatabase from "./mongodb";
import User from "@/database/user.model";
import type { UserDocument } from "@/database/user.model";

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
          typeof credentials?.email === "string" ? credentials.email : undefined;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;

        if (!email || !password) return null;

        await connectToDatabase();

        const user = (await User.findOne({
          email: email.trim().toLowerCase(),
        })) as UserDocument | null;

        if (!user) return null;

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
