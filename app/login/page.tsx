"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/validations/auth";
import { useToast } from "@/hooks/useToast";


function getSafeCallbackUrl(url: string | null): string {
  if (url && url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return "/";
}

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setLoading(true);

    
    try {
      const response = await signIn("credentials", {
        email: result.data.email,
        password: result.data.password,
        redirect: false,
      });

      if (response?.error) {
        setError("Invalid email or password.");
        return;
      }

      toast.success("Signed in successfully.");
      router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-center">Sign In</h1>
      <p className="mt-3 text-center text-gray-400">
        Welcome back to Dev Event.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-dark-200 bg-dark-200 px-4 py-3 outline-none transition focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary/80 px-6 py-3 font-medium text-black transition hover:bg-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary underline">
          Create one
        </Link>
      </p>
    </section>
  );
};

export default LoginPage;
