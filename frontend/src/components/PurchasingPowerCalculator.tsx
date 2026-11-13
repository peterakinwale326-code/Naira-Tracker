"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalculatorSkeleton } from "./Skeleton";
import { Calculator, ArrowRight, Bookmark, Copy } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface CalculationData {
  baseYear: number;
  targetYear: number;
  initialAmount: number;
  equivalentToday: number;
  purchasingPowerLossPercent: number;
  compoundedInflationRate: number;
  realResidualValue: number;
}

interface TrendPoint {
  year: number;
  month: number;
  cpiIndex: number;
}

interface Props {
  apiBaseUrl?: string;
  onSaveScenario?: (data: CalculationData) => void;
  isLoadingInitial?: boolean;
}

export function PurchasingPowerCalculator({
  apiBaseUrl = API_BASE_URL,
  onSaveScenario,
  isLoadingInitial = false,
}: Props) {
  const [amount, setAmount] = useState(100000);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [baseYear, setBaseYear] = useState<number | null>(null);
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [result, setResult] = useState<CalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBaseUrl}/api/v1/inflation/trends`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(`CPI readings could not be loaded (HTTP ${response.status}).`);
        return response.json() as Promise<TrendPoint[]>;
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
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load CPI readings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [apiBaseUrl]);

  const annualReadings = useMemo(() => {
    const byYear = new Map<number, TrendPoint>();
    for (const row of trends) {
      if (row.year < 2025) continue;
      const current = byYear.get(row.year);
      if (!current || row.month > current.month) byYear.set(row.year, row);
    }
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }, [trends]);
  const baseCpi = annualReadings.find(row => row.year === baseYear)?.cpiIndex;
  const targetCpi = annualReadings.find(row => row.year === targetYear)?.cpiIndex;

  const calculate = async () => {
    if (!Number.isFinite(amount) || amount <= 0 || baseYear === null || targetYear === null) {
      setError("Enter a positive amount and choose two comparable years.");
      return;
    }
    setCalculating(true);
    setError(null);
    try {
      const query = new URLSearchParams({ amount: String(amount), baseYear: String(baseYear), targetYear: String(targetYear) });
      const response = await fetch(`${apiBaseUrl}/api/v1/inflation/calculate?${query}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Calculation failed (HTTP ${response.status}).`);
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not calculate purchasing power.");
    } finally {
      setCalculating(false);
    }
  };

  if (isLoadingInitial) return <CalculatorSkeleton />;

  const handleCopySummary = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `₦${amount.toLocaleString("en-NG")} in ${result.baseYear} requires ₦${result.equivalentToday.toLocaleString("en-NG")} in ${result.targetYear}.`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white font-sans shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50 p-4 sm:px-6">
        <div className="font-bold text-sm text-zinc-900">Purchasing power calculator</div>
        <p className="mt-1 text-xs text-zinc-500">Uses published UN monthly CPI index readings from the post-January 2025 series.</p>
      </div>
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div className="space-y-5">
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <label className="block text-xs font-semibold text-zinc-700">Amount (₦)<input type="number" min="1" value={amount} onChange={event => setAmount(Number(event.target.value))} className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 font-mono text-base" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-zinc-700">From year<select value={baseYear ?? ""} onChange={event => setBaseYear(Number(event.target.value))} className="mt-2 w-full rounded border border-zinc-300 px-3 py-2">{annualReadings.filter(row => targetYear === null || row.year < targetYear).map(row => <option key={row.year} value={row.year}>{row.year}</option>)}</select></label>
            <label className="text-xs font-semibold text-zinc-700">To year<select value={targetYear ?? ""} onChange={event => setTargetYear(Number(event.target.value))} className="mt-2 w-full rounded border border-zinc-300 px-3 py-2">{annualReadings.filter(row => baseYear === null || row.year > baseYear).map(row => <option key={row.year} value={row.year}>{row.year}</option>)}</select></label>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">{baseCpi?.toLocaleString("en-NG")} <ArrowRight size={14} /> {targetCpi?.toLocaleString("en-NG")} CPI index</div>
          <button type="button" onClick={calculate} disabled={loading || calculating || annualReadings.length < 2} className="flex w-full items-center justify-center gap-2 rounded bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"><Calculator size={15} />{loading ? "Loading CPI readings…" : calculating ? "Calculating…" : "Calculate"}</button>
        </div>
        <div className="rounded-lg bg-zinc-900 p-5 text-white">
          <p className="text-xs text-zinc-400">Equivalent amount</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">₦{result?.equivalentToday.toLocaleString("en-NG") || "—"}</p>
          <p className="mt-4 text-xs text-zinc-400">Purchasing power lost</p>
          <p className="mt-1 text-xl font-bold">{result ? `${result.purchasingPowerLossPercent.toFixed(1)}%` : "—"}</p>
          {result && <div className="mt-5 flex gap-3 border-t border-zinc-700 pt-4">
            <button type="button" onClick={handleCopySummary} className="flex items-center gap-2 text-xs text-zinc-300"><Copy size={14} />{copied ? "Copied" : "Copy"}</button>
            {onSaveScenario && <button type="button" onClick={() => onSaveScenario(result)} className="flex items-center gap-2 text-xs text-zinc-300"><Bookmark size={14} />Save</button>}
          </div>}
        </div>
      </div>
    </div>
  );
}
