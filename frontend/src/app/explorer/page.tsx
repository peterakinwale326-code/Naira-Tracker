"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

type Trend = {
  period: string;
  year: number;
  month: number;
  cpiIndex: number;
  cpiYearOverYearRate: number | null;
  cpiMonthOverMonthRate: number | null;
  indexBase: string;
  source: string;
};

const formatRate = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(2)}%`;

export default function ExplorerPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"3Y" | "5Y" | "10Y" | "ALL">("ALL");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/v1/inflation/trends`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(`The CPI data service returned HTTP ${response.status}.`);
        return response.json() as Promise<Trend[]>;
      })
      .then(setTrends)
      .catch(cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : "Could not load CPI observations.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = timeframe === "3Y" ? currentYear - 2
      : timeframe === "5Y" ? currentYear - 4
        : timeframe === "10Y" ? currentYear - 9 : 0;
    return trends.filter(row => row.year >= startYear);
  }, [timeframe, trends]);

  const chartData = filtered.map(row => ({
    period: row.period,
    cpiIndex: row.cpiIndex,
    yearOverYear: row.cpiYearOverYearRate,
    monthOverMonth: row.cpiMonthOverMonthRate,
  }));
  const tickInterval = Math.max(0, Math.floor(chartData.length / 12) - 1);

  if (authLoading || !user) return null;

  return (
    <AppLayout title="Inflation data" subtitle="Monthly CPI index observations from the UN Statistics Division.">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(["3Y", "5Y", "10Y", "ALL"] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeframe(range)}
            className={`rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${timeframe === range ? "bg-[#191a19] text-white" : "border border-stone-200 bg-white text-stone-600"}`}
            aria-pressed={timeframe === range}
          >
            {range}
          </button>
        ))}
        <span className="ml-auto text-xs text-stone-500">{filtered.length} monthly observations</span>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          CPI readings could not be loaded: {error}
        </div>
      )}

      <section className="mb-5 rounded-[18px] border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Monthly consumer price index</h2>
        <p className="mt-1 text-xs text-stone-500">
          CPI index level and percentage changes calculated from the published monthly index. A dash means a comparable observation is unavailable.
        </p>
        <div className="mt-4 h-80">
          {loading ? (
            <div className="skeleton h-full rounded-[12px]" />
          ) : chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-stone-500">No CPI readings are available for this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="period"
                  interval={tickInterval}
                  tickFormatter={period => String(period).slice(0, 4)}
                  tick={{ fill: "#78716c", fontSize: 11 }}
                />
                <YAxis yAxisId="rate" unit="%" tick={{ fill: "#78716c", fontSize: 11 }} />
                <YAxis yAxisId="index" orientation="right" tick={{ fill: "#78716c", fontSize: 11 }} />
                <Tooltip
                  labelFormatter={period => `Period: ${period}`}
                  formatter={(value: number | null, name: string) => [
                    value === null ? "Unavailable" : name === "CPI index"
                      ? value.toLocaleString("en-NG", { maximumFractionDigits: 3 })
                      : `${value.toFixed(2)}%`,
                    name,
                  ]}
                />
                <Legend />
                <Line yAxisId="index" type="monotone" dataKey="cpiIndex" name="CPI index" stroke="#191a19" strokeWidth={2} dot={false} connectNulls={false} />
                <Line yAxisId="rate" type="monotone" dataKey="yearOverYear" name="Change vs same month last year" stroke="#e95024" strokeWidth={2} dot={false} connectNulls={false} />
                <Line yAxisId="rate" type="monotone" dataKey="monthOverMonth" name="Change vs prior month" stroke="#18804a" strokeWidth={1.5} dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="mt-3 border-t border-stone-100 pt-3 text-[10px] leading-5 text-stone-500">
          Source: United Nations Statistics Division, Monthly Bulletin of Statistics · The January 2025 series break is not compared across. Food and core inflation are not published in this series.
        </p>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="text-sm font-semibold">All monthly CPI readings</h2>
          <p className="mt-1 text-xs text-stone-500">Newest observation first · index base: {filtered[filtered.length - 1]?.indexBase || "as published"}</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2 p-5">{Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton h-10 rounded-[8px]" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">No CPI readings are available.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>CPI index</th>
                  <th>Year-over-year change</th>
                  <th>Month-over-month change</th>
                  <th>Index base</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map(row => (
                  <tr key={row.period}>
                    <td className="font-mono font-semibold">{row.period}</td>
                    <td className="font-mono">{row.cpiIndex.toLocaleString("en-NG", { maximumFractionDigits: 3 })}</td>
                    <td className="font-mono">{formatRate(row.cpiYearOverYearRate)}</td>
                    <td className="font-mono">{formatRate(row.cpiMonthOverMonthRate)}</td>
                    <td className="text-xs text-stone-500">{row.indexBase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
