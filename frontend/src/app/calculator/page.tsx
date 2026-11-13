"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import { Calculator, ArrowRight, Save, Copy, CheckCircle2 } from "lucide-react";

type Trend = {
  year: number;
  month: number;
  cpiIndex: number;
  indexBase: string;
};

type CalculationResult = {
  equivalentToday: number;
  purchasingPowerLossPercent: number;
};

export default function CalculatorPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, saveCalculation } = useAuth();
  const [amount, setAmount] = useState("100000");
  const [baseYear, setBaseYear] = useState<number | null>(null);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/v1/inflation/trends`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(`CPI readings could not be loaded (HTTP ${response.status}).`);
        return response.json() as Promise<Trend[]>;
      })
      .then(rows => {
        setTrends(rows);
        const years = Array.from(new Set(rows.filter(row => row.year >= 2025).map(row => row.year))).sort((a, b) => a - b);
        if (years.length >= 2) {
          setBaseYear(years[0]);
          setTargetYear(years[years.length - 1]);
        }
      })
      .catch(cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Could not load CPI readings.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingData(false);
      });
    return () => controller.abort();
  }, []);

  const annualReadings = useMemo(() => {
    const byYear = new Map<number, Trend>();
    for (const row of trends) {
      const current = byYear.get(row.year);
      if (!current || row.month > current.month) byYear.set(row.year, row);
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [trends]);
  const comparableYears = annualReadings.filter(row => row.year >= 2025);
  const baseCpi = annualReadings.find(row => row.year === baseYear)?.cpiIndex;
  const targetCpi = annualReadings.find(row => row.year === targetYear)?.cpiIndex;
  const pctChange = baseCpi && targetCpi
    ? (((targetCpi - baseCpi) / baseCpi) * 100).toFixed(2)
    : null;

  const calculate = async () => {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0 || baseYear === null || targetYear === null) {
      setError("Enter a positive amount and choose two available years.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const query = new URLSearchParams({
        amount,
        baseYear: String(baseYear),
        targetYear: String(targetYear),
      });
      const response = await fetch(`${API_BASE_URL}/api/v1/inflation/calculate?${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || `Calculation failed (HTTP ${response.status}).`);
      }
      setResult(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not calculate purchasing power.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result || baseYear === null || targetYear === null) return;
    await navigator.clipboard.writeText(
      `₦${Number(amount).toLocaleString("en-NG")} in ${baseYear} = ₦${result.equivalentToday.toLocaleString("en-NG")} in ${targetYear}. Purchasing power lost: ${result.purchasingPowerLossPercent.toFixed(1)}%.`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result || baseYear === null || targetYear === null) return;
    const response = await saveCalculation({
      title: `₦${Number(amount).toLocaleString("en-NG")} (${baseYear} → ${targetYear})`,
      amount: Number(amount),
      baseYear,
      targetYear,
      equivalentAmount: result.equivalentToday,
      lossPercent: result.purchasingPowerLossPercent,
    });
    if (!response.success) {
      setError(response.error || "Could not save this calculation.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout title="Purchasing power" subtitle="Compare amounts using published UN CPI index readings.">
      <div className="max-w-3xl space-y-5">
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>}

        <section className="rounded-[18px] border border-white/10 bg-zinc-900 p-6 text-white">
          <div className="mb-5">
            <label htmlFor="amount" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400">Amount (₦)</label>
            <input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              className="w-full rounded-lg border border-[#d6d3ca] bg-white px-4 py-3 text-[#171713] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Base year</div>
              <div className="flex flex-wrap gap-2">
                {comparableYears.filter(row => targetYear === null || row.year < targetYear).map(row => (
                  <button key={row.year} type="button" onClick={() => setBaseYear(row.year)} className={`rounded-lg px-3 py-1.5 font-mono text-xs ${baseYear === row.year ? "bg-emerald-500 text-white" : "border border-white/10 text-zinc-300"}`}>{row.year}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Target year</div>
              <div className="flex flex-wrap gap-2">
                {comparableYears.filter(row => baseYear === null || row.year > baseYear).map(row => (
                  <button key={row.year} type="button" onClick={() => setTargetYear(row.year)} className={`rounded-lg px-3 py-1.5 font-mono text-xs ${targetYear === row.year ? "bg-cyan-600 text-white" : "border border-white/10 text-zinc-300"}`}>{row.year}</button>
                ))}
              </div>
            </div>
          </div>

          {baseYear !== null && targetYear !== null && baseCpi !== undefined && targetCpi !== undefined && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs text-zinc-400">
              <span>{baseYear}: <strong className="text-white">{baseCpi.toLocaleString("en-NG")}</strong></span>
              <ArrowRight size={14} />
              <span>{targetYear}: <strong className="text-white">{targetCpi.toLocaleString("en-NG")}</strong></span>
              {pctChange !== null && <span className="ml-auto">Index change: {pctChange}%</span>}
            </div>
          )}

          <button onClick={calculate} disabled={loading || loadingData || comparableYears.length < 2} className="btn-primary w-full py-3.5 text-sm disabled:opacity-50">
            <Calculator size={16} />
            {loading ? "Calculating…" : loadingData ? "Loading CPI readings…" : "Calculate"}
          </button>
          {!loadingData && comparableYears.length < 2 && <p className="mt-3 text-xs text-amber-300">At least two comparable post-2025 annual CPI readings are required.</p>}
        </section>

        {result && baseYear !== null && targetYear !== null && (
          <section className="rounded-[18px] border border-emerald-800 bg-emerald-950/30 p-6 text-white">
            <div className="mb-4 text-xs font-mono uppercase tracking-widest text-emerald-400">₦{Number(amount).toLocaleString("en-NG")} · {baseYear} → {targetYear}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><p className="text-xs text-zinc-400">Equivalent amount in {targetYear}</p><p className="mt-1 text-3xl font-bold tabular-nums">₦{result.equivalentToday.toLocaleString("en-NG")}</p></div>
              <div><p className="text-xs text-zinc-400">Purchasing power lost</p><p className="mt-1 text-3xl font-bold tabular-nums">{result.purchasingPowerLossPercent.toFixed(1)}%</p></div>
            </div>
            <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">
              <button onClick={handleCopy} className="btn-ghost gap-2 px-4 py-2.5 text-xs">{copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
              <button onClick={handleSave} className="btn-glass gap-2 px-4 py-2.5 text-xs">{saved ? <CheckCircle2 size={15} /> : <Save size={15} />}{saved ? "Saved" : "Save calculation"}</button>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-[18px] border border-white/10 bg-zinc-900 text-white">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Published annual CPI reference readings</h2>
            <p className="mt-1 text-xs text-zinc-400">Latest available month for each year · values are not compared across the January 2025 series break.</p>
          </div>
          <div className="overflow-x-auto">
            {loadingData ? <div className="p-5 text-sm text-zinc-400">Loading observations…</div> : annualReadings.length === 0 ? <div className="p-5 text-sm text-zinc-400">No CPI readings available.</div> : (
              <table className="w-full min-w-[420px] text-left text-sm text-zinc-100">
                <thead className="border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-wide text-zinc-300">
                  <tr><th className="px-5 py-3">Period</th><th className="px-5 py-3">CPI index</th><th className="px-5 py-3">Index base</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[...annualReadings].reverse().map(row => (
                    <tr key={row.year} className="hover:bg-white/5">
                      <td className="px-5 py-3 font-mono">{row.year}-{String(row.month).padStart(2, "0")}</td>
                      <td className="px-5 py-3 tabular-nums">{row.cpiIndex.toLocaleString("en-NG", { maximumFractionDigits: 3 })}</td>
                      <td className="px-5 py-3">{row.indexBase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="border-t border-white/10 p-4 text-[10px] leading-5 text-zinc-400">Source: UN Statistics Division, Monthly Bulletin of Statistics. This calculator uses the post-break CPI index only and is not an official NBS food or headline inflation calculator.</p>
        </section>
      </div>
    </AppLayout>
  );
}
