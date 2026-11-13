"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#121c2b] via-[#0c1421] to-[#050910] text-zinc-900 font-sans">
      {/* Outer rounded card frame */}
      <div className="w-full max-w-[1020px] bg-white rounded-[38px] p-3 sm:p-5 shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20">
        
        {/* Left Side: Modern Tech Visual with glowing circuit / cyberpunk visual */}
        <div className="w-full md:w-[48%] relative rounded-[28px] overflow-hidden min-h-[380px] md:min-h-[640px] flex flex-col justify-between p-8 bg-zinc-950">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop')`, // Cyber security / modern tech shield
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-transparent to-blue-900/30" />

          {/* Top Logo */}
          <div className="relative z-10 flex justify-center w-full pt-4">
            <div className="flex items-center justify-center text-white drop-shadow-md">
              <svg width="44" height="34" viewBox="0 0 44 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C6.5 4 2 8.5 2 14C2 19.5 6.5 24 12 24C16 24 19.5 21 21.5 17C19.5 13 16 10 12 10C8.5 10 6 12 6 14C6 16 8.5 18 12 18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M32 4C37.5 4 42 8.5 42 14C42 19.5 37.5 24 32 24C28 24 24.5 21 22.5 17C24.5 13 28 10 32 10C35.5 10 38 12 38 14C38 16 35.5 18 32 18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="relative z-10 text-center">
            <span className="text-[11px] font-mono tracking-widest text-white/50 uppercase">
              Naira Tracker · Account Security
            </span>
          </div>
        </div>

        {/* Right Side: Clean Form */}
        <div className="w-full md:w-[52%] px-6 sm:px-12 py-8 flex flex-col justify-center">
          
          <Link href="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Back to login</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">
            Reset Password
          </h1>
          
          <p className="text-sm text-zinc-600 mb-8 font-normal">
            Enter the email associated with your account and we&apos;ll send you instructions to reset your password.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Check your inbox</h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                If an account exists for <strong className="text-zinc-900">{email}</strong>, a password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-block py-2.5 px-6 rounded-full bg-black text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Return to Log in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-zinc-200 bg-white text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-zinc-500">
                  Remembered your password?{" "}
                  <Link href="/login" className="font-bold underline text-zinc-900 hover:opacity-80 transition-opacity">
                    Log in
                  </Link>
                </span>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
