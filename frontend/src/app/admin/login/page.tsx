"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [isLoading, router, user]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await adminLogin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      router.replace("/admin");
    } else {
      setError(result.error || "Unable to verify administrator access.");
    }
  };

  return (
    <main className="nt-auth-wrap">
      <div className="nt-auth-card">
        <section className="nt-auth-visual">
          <Link href="/" className="nt-auth-logo">
            naira tracker
            <span className="mt-1 block text-[9px] font-mono uppercase tracking-[.18em] text-white/55">
              Restricted administration
            </span>
          </Link>
          <div className="nt-auth-quote">
            Platform administration.
            <small>Authorized administrators only</small>
          </div>
        </section>

        <section className="nt-auth-form">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs text-stone-500 hover:text-black">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <div className="nt-eyebrow flex items-center gap-2">
            <ShieldCheck size={14} /> Restricted access
          </div>
          <h1 className="mt-2 font-serif text-5xl tracking-tight">Admin sign in</h1>
          <p className="mb-7 mt-3 text-xs text-stone-500">
            Sign in with an administrator account to open the Naira Tracker console.
          </p>

          {error && (
            <div role="alert" className="nt-auth-error flex items-center gap-2">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="nt-field">
              <label htmlFor="admin-email">Administrator email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="nt-field">
              <label htmlFor="admin-password">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Your administrator password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="!pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button className="nt-form-submit" type="submit" disabled={loading || isLoading}>
              {loading ? "Verifying access…" : "Sign in to admin console"}
            </button>
          </form>

          <p className="mt-7 text-center text-[11px] text-stone-500">
            Regular account?{" "}
            <Link href="/login" className="font-semibold text-stone-800 underline">
              User sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
