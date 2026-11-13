"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import { Briefcase, TrendingUp, ArrowRight, Info } from "lucide-react";

type Trend = { year: number; month: number; cpiIndex: number };
type AnnualReading = { year: number; month: number; cpiIndex: number };

const PRESETS = [
  { label: "Entry level", amount: 80000 },
  { label: "Mid-level", amount: 250000 },
  { label: "Senior", amount: 500000 },
  { label: "Executive", amount: 1500000 },
];

export default function SalaryCheckPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [salary, setSalary] = useState("150000");
  const [year, setYear] = useState<number | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [result, setResult] = useState<{ adjusted: number; increase: number; targetYear: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      .then(setTrends)
      .catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load CPI readings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const annualReadings = useMemo(() => {
    const byYear = new Map<number, AnnualReading>();
    for (const row of trends) {
      if (row.year < 2025) continue;
      const current = byYear.get(row.year);
      if (!current || row.month > current.month) byYear.set(row.year, row);
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [trends]);
  const target = annualReadings[annualReadings.length - 1];
  const base = annualReadings.find(row => row.year === year);

  const calculate = () => {
    const amount = Number(salary);
    if (!Number.isFinite(amount) || amount <= 0 || !base || !target || target.year <= base.year) {
      setError("Enter a positive salary and choose a year with a later comparable CPI reading.");
      return;
    }
    const factor = target.cpiIndex / base.cpiIndex;
    setResult({
      adjusted: Math.round(amount * factor),
      increase: (factor - 1) * 100,
      targetYear: target.year,
    });
    setError(null);
  };

  if (authLoading || !user) return null;

  return (
    <AppLayout title="Salary audit" subtitle="Compare salary amounts using comparable published CPI readings.">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>This is an inflation-adjusted comparison, not a recommended or legally required salary. It uses the independent UN CPI index, not NBS wage or food data.</span>
        </div>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>}

        <section className="rounded-[18px] border border-[#e6e2d9] bg-white p-6 text-[#171713]">
          <h2 className="mb-6 text-base font-semibold tracking-tight">Salary details</h2>
          <div className="mb-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-600">Quick presets (monthly ₦)</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => <button key={preset.label} onClick={() => setSalary(String(preset.amount))} className="rounded-lg border border-[#e6e2d9] bg-[#faf9f6] px-3 py-2 text-xs text-stone-700 transition hover:bg-[#f1eee6]">{preset.label} · ₦{preset.amount.toLocaleString("en-NG")}</button>)}
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="salary" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-600">Monthly salary (₦)</label>
            <input id="salary" type="number" min="1" value={salary} onChange={event => setSalary(event.target.value)} className="w-full rounded-lg border border-[#d6d3ca] bg-white px-4 py-3 text-[#171713] outline-none focus:border-[#b38a45] focus:ring-2 focus:ring-[#b38a45]/20" />
          </div>

          <div className="mb-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-600">Salary year</div>
            <div className="flex flex-wrap gap-2">
              {annualReadings.filter(row => !target || row.year < target.year).map(row => (
                <button key={row.year} onClick={() => setYear(row.year)} className={`rounded-lg px-3.5 py-2 font-mono text-xs transition ${year === row.year ? "bg-violet-700 text-white" : "border border-[#e6e2d9] bg-[#faf9f6] text-stone-700 hover:bg-[#f1eee6]"}`}>{row.year}</button>
              ))}
            </div>
          </div>

          <button onClick={calculate} disabled={loading || annualReadings.length < 2} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#191a19] py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
            <Briefcase size={16} />{loading ? "Loading CPI readings…" : "Calculate inflation-adjusted amount"}
          </button>
          {!loading && annualReadings.length < 2 && <p className="mt-3 text-xs text-amber-800">At least two comparable post-2025 CPI readings are required.</p>}
        </section>

        {result && base && target && (
          <section className="rounded-[18px] border border-violet-200 bg-violet-50 p-6 text-[#171713]">
            <div className="mb-5 text-xs font-mono uppercase tracking-widest text-violet-800">CPI-adjusted comparison · {year} → {result.targetYear}</div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div><p className="text-xs text-stone-600">Entered monthly salary</p><p className="mt-1 text-2xl font-bold tabular-nums">₦{Number(salary).toLocaleString("en-NG")}</p></div>
              <div className="flex items-center justify-center"><div className="text-center"><ArrowRight size={20} className="mx-auto text-violet-700" /><p className="mt-1 text-xs text-stone-600">×{(target.cpiIndex / base.cpiIndex).toFixed(3)}</p></div></div>
              <div><p className="text-xs text-stone-600">Equivalent CPI-adjusted amount</p><p className="mt-1 text-2xl font-bold tabular-nums">₦{result.adjusted.toLocaleString("en-NG")}</p></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-violet-200 pt-4 text-sm"><span className="flex items-center gap-2"><TrendingUp size={15} /> Index increase over the selected period</span><strong>{result.increase.toFixed(2)}%</strong></div>
          </section>
        )}

        <section className="overflow-hidden rounded-[18px] border border-[#e6e2d9] bg-white">
          <div className="border-b border-[#e6e2d9] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#171713]">Comparable annual CPI readings</h2>
            <p className="mt-1 text-xs text-stone-600">Latest observed month in each year · post-January 2025 series only</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? <div className="p-5 text-sm text-stone-600">Loading observations…</div> : annualReadings.length === 0 ? <div className="p-5 text-sm text-stone-600">No comparable CPI readings available.</div> : (
              <table className="w-full min-w-[420px] text-left text-sm text-[#292820]">
                <thead className="border-b border-[#e6e2d9] bg-[#f7f6f2] text-[10px] uppercase tracking-wide text-stone-600">
                  <tr><th className="px-5 py-3">Period</th><th className="px-5 py-3">CPI index</th><th className="px-5 py-3">Index base</th></tr>
                </thead>
                <tbody className="divide-y divide-[#efede7]">
                  {[...annualReadings].reverse().map(row => (
                    <tr key={row.year}>
                      <td className="px-5 py-3 font-mono">{row.year}-{String(row.month).padStart(2, "0")}</td>
                      <td className="px-5 py-3 tabular-nums">{row.cpiIndex.toLocaleString("en-NG", { maximumFractionDigits: 3 })}</td>
                      <td className="px-5 py-3">UN published series</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
