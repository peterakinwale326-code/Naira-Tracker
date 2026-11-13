"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Lock, Globe } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-800 font-sans p-4 sm:p-10 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-[32px] p-8 sm:p-14 shadow-sm border border-slate-200/80">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-xs text-slate-500 font-mono">Last updated: November 2024</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 pt-4 border-t border-slate-100">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using Naira Tracker, you agree to be bound by these Terms and Conditions and all applicable macroeconomic transparency laws. If you do not agree with any of these terms, you are prohibited from using or accessing this application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              2. Data Sources &amp; Empirical Accuracy
            </h2>
            <p className="leading-relaxed">
              Naira Tracker gathers and computes inflation indicators sourced directly from published National Bureau of Statistics (NBS) Consumer Price Index (CPI) bulletins and Selected Food Price watch surveys. While models provide mathematically rigorous deflation computations (Laspeyres formula), historical indicators represent past currency velocity and do not constitute direct speculative trading recommendations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              3. Privacy &amp; Portfolio Calculations
            </h2>
            <p className="leading-relaxed">
              Any custom scenario, salary audit, or deflated financial model you save to your workspace is encrypted and securely linked to your account. We never share or sell individualized user portfolio scenarios or wage data to third-party institutions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. User Authentication</h2>
            <p className="leading-relaxed">
              You are responsible for safeguarding your login credentials. You agree not to disclose your password to any third party and to notify us immediately upon becoming aware of any breach of security or unauthorized access.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>&copy; 2026 Naira Tracker. All rights reserved.</span>
          <Link href="/login" className="font-semibold text-slate-800 hover:underline">
            Proceed to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
